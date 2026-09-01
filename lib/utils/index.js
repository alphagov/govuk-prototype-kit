// core dependencies
const crypto = require('crypto')
const { existsSync, lstatSync, readdirSync } = require('fs')
const { readdir, stat, readFile, writeFile } = require('fs/promises')
const path = require('path')
const readline = require('readline/promises')
const semver = require('semver')

// npm dependencies
const portScanner = require('portscanner')

// local dependencies
const config = require('../config').getConfig()
const filters = require('../filters/api')
const functions = require('../functions/api')
const plugins = require('../plugins/plugins')
const routes = require('../routes/api')
const { appDir, projectDir } = require('./paths')
const { asyncSeriesMap } = require('./asyncSeriesMap')
const { runWhenEnvIsAvailable: runWhenFiltersEnvIsAvailable } = require('../filters/api')
const { runWhenEnvIsAvailable: runWhenFunctionsEnvIsAvailable } = require('../functions/api')

/**
 * Application scripts passed into `plugins.getAppConfig()` where
 * plugin {@link ConfigScript} is converted to {@link AppScript}
 *
 * @type {(AppScript | string)[]}
 */
const scripts = []
if (existsSync(path.join(projectDir, 'app', 'assets', 'javascripts', 'application.js'))) {
  scripts.push({
    src: '/public/javascripts/application.js',
    type: 'module'
  })
}
if (plugins.legacyGovukFrontendFixesNeeded()) {
  scripts.push('/plugin-assets/govuk-prototype-kit/lib/assets/javascripts/optional/legacy-govuk-frontend-init.js')
}

// Require core and custom filters, merges to one object
// and then add the methods to Nunjucks environment
function addNunjucksFilters (env) {
  filters.setEnvironment(env)
  const additionalFilters = []
  const filtersPath = path.join(appDir, 'filters.js')
  if (existsSync(filtersPath)) {
    additionalFilters.push(filtersPath)
  }
  runWhenFiltersEnvIsAvailable(() => {
    const filterFiles = plugins.getFileSystemPaths('nunjucksFilters').concat(additionalFilters)
    filterFiles.forEach(x => require(x))
  })
}

// Require core and custom functions, merges to one object
// and then add the methods to Nunjucks environment
function addNunjucksFunctions (env) {
  functions.setEnvironment(env)
  const additionalFunctions = []
  const functionsPath = path.join(appDir, 'functions.js')
  if (existsSync(functionsPath)) {
    additionalFunctions.push(functionsPath)
  }
  runWhenFunctionsEnvIsAvailable(() => {
    const globalFiles = plugins.getFileSystemPaths('nunjucksFunctions').concat(additionalFunctions)
    globalFiles.forEach(x => require(x))
  })
}

function addRouters (app) {
  routes.setApp(app)
  const routesPath = path.join(appDir, 'routes.js')
  if (existsSync(routesPath)) {
    require(routesPath)
  }
}

// Ask a yes/no question in the terminal. 'y'/'yes' answers yes, 'n'/'no'
// answers no, an empty answer resolves to `defaultAnswer`, and anything else
// re-asks the question.
async function confirm (message, defaultAnswer = true) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  // On Ctrl+C readline with no SIGINT listener just closes the interface:
  // no signal is raised and the process only exits if the event loop is
  // empty, so exit explicitly and predictably
  rl.on('SIGINT', () => {
    rl.close()
    console.log('')
    process.exit(130) // conventional exit code for SIGINT (128 + 2)
  })
  const hint = defaultAnswer ? '(Y/n)' : '(y/N)'
  try {
    let result
    while (result === undefined) {
      const answer = (await rl.question(`${message} ${hint} `)).trim().toLowerCase()
      if (answer === '') {
        result = defaultAnswer
      } else if (answer === 'y' || answer === 'yes') {
        result = true
      } else if (answer === 'n' || answer === 'no') {
        result = false
      }
      // Unrecognised answer - ask again
    }
    return result
  } finally {
    rl.close()
  }
}

// Find an available port to run the server on
async function findAvailablePort () {
  const port = config.port

  console.log('')

  // Check port is free, else offer to change
  const availablePort = await portScanner.findAPortNotInUse(port, port + 50, '127.0.0.1')
  if (port === availablePort) {
    return port
  }

  // Port in use - offer to change to available port
  console.error('ERROR: Port ' + port + ' in use - you may have another prototype running.\n')

  const changePort = await confirm('Change to an available port?')
  if (!changePort) {
    // User answers no - exit
    process.exit(0)
  }

  console.log('Changed to port ' + availablePort)
  console.log('')

  return availablePort
}

// Redirect HTTP requests to HTTPS
function forceHttps (req, res, next) {
  if (req.protocol !== 'https') {
    console.log('Redirecting request to https')
    // 302 temporary - this is a feature that can be disabled
    return res.redirect(302, 'https://' + req.get('Host') + req.url)
  }

  // Mark proxy as secure (allows secure cookies)
  req.connection.proxySecure = true
  next()
}

// Try to match a request to a template, for example a request for /test
// would look for /app/views/test.html
// and /app/views/test/index.html

async function renderPath (urlPath, res, next) {
  const model = {}
  if (urlPath === 'index') {
    model.serviceNameFileLocation = 'app/config.json'
  }
  // Try to render the path
  res.render(urlPath, model, async (error, html) => {
    if (!error) {
      // Success - send the response
      res.set({ 'Content-type': 'text/html; charset=utf-8' })
      res.end(html)
      return
    }
    if (!error.message.startsWith('template not found')) {
      // We got an error other than template not found - call next with the error
      next(error)
      return
    }
    if (!urlPath.endsWith('/index')) {
      // Maybe it's a folder - try to render [path]/index.njk
      await renderPath(urlPath + '/index', res, next)
      return
    }
    // We got template not found both times - call next to trigger the 404 page
    next()
  })
}

async function matchRoutes (req, res, next) {
  let path = decodeURI(req.path).normalize()

  // Remove the first slash, render won't work with it
  path = path.substr(1)

  // If it's blank, render the root index
  if (path === '') {
    path = 'index'
  }

  await renderPath(path, res, next)
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitUntilFileExists (filename, timeout) {
  await sleep(500)
  const fileExists = existsSync(filename)
  if (!fileExists) {
    if (timeout > 0) {
      return waitUntilFileExists(filename, timeout - 500)
    } else {
      throw new Error(`File ${filename} does not exist`)
    }
  }
}

function encryptPassword (password) {
  const hash = crypto.createHash('sha256')
  hash.update(password)
  return hash.digest('hex')
}

function sessionFileStoreQuietLogFn (message) {
  if (message.endsWith('Deleting expired sessions')) {
    // session-file-store logs every time it prunes files for expired sessions,
    // but this isn't useful for our users, so let's just swallow those messages
    return
  }

  // Handling case where a user has multiple prototypes in the same working directory by giving a more useful error message
  if (message.includes('ENOENT')) {
    console.error('Warning: Please use different working directories for your prototypes to avoid session clashes')
    return
  }
  console.log(message)
}

function recursiveDirectoryContentsSync (baseDir) {
  function goThroughDir (dir = '') {
    const fullPath = path.join(baseDir, dir)
    if (!existsSync(fullPath)) {
      return []
    }
    const dirContents = readdirSync(fullPath)
    return dirContents.map(item => {
      const lstat = lstatSync(path.join(fullPath, item))
      const isDir = lstat.isDirectory()
      const itemPath = path.join(dir, item)
      if (isDir) {
        return goThroughDir(itemPath)
      }
      return itemPath
    }).flat()
  }

  return goThroughDir()
}

async function searchAndReplaceFiles (dir, searchText, replaceText, extensions) {
  const files = await readdir(dir)
  const modifiedFiles = await asyncSeriesMap(files, async file => {
    const filePath = path.join(dir, file)
    const fileStat = await stat(filePath)

    if (fileStat.isDirectory()) {
      return await searchAndReplaceFiles(filePath, searchText, replaceText, extensions)
    } else if (extensions.some(extension => file.endsWith(extension))) {
      let fileContent = await readFile(filePath, 'utf8')
      if (fileContent.includes(searchText)) {
        fileContent = fileContent.replace(new RegExp(searchText, 'g'), replaceText)
        await writeFile(filePath, fileContent)
        return filePath
      }
    }
  })

  return modifiedFiles.flat().filter(Boolean)
}

function sortByObjectKey (key) {
  return function (a, b) {
    if (a[key] > b[key]) {
      return 1
    }
    if (b[key] > a[key]) {
      return -1
    }
    return 0
  }
}

function hasNewVersion (installedVersion, latestVersion) {
  if (!latestVersion) {
    return false
  }

  try {
    return semver.gt(latestVersion, installedVersion)
  } catch (error) {
    return false
  }
}

module.exports = {
  prototypeAppScripts: scripts,
  addNunjucksFilters,
  addNunjucksFunctions,
  addRouters,
  findAvailablePort,
  forceHttps,
  matchRoutes,
  sleep,
  waitUntilFileExists,
  encryptPassword,
  sessionFileStoreQuietLogFn,
  searchAndReplaceFiles,
  recursiveDirectoryContentsSync,
  sortByObjectKey,
  hasNewVersion
}

/**
 * @typedef {import('../plugins/plugins').AppScript} AppScript
 * @typedef {import('../plugins/plugins').ConfigScript} ConfigScript
 */
