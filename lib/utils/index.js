
// core dependencies
const crypto = require('crypto')
const fs = require('fs')
const fsp = fs.promises
const path = require('path')
const { existsSync } = require('fs')

// npm dependencies
const inquirer = require('inquirer')
const portScanner = require('portscanner')
const { marked } = require('marked')

// local dependencies
const config = require('../config').getConfig()
const filters = require('../filters/api')
const functions = require('../functions/api')
const plugins = require('../plugins/plugins')
const routes = require('../routes/api')
const { appDir, projectDir } = require('./paths')
const { asyncSeriesMap } = require('./asyncSeriesMap')

// Tweak the Markdown renderer
const defaultMarkedRenderer = marked.defaults.renderer || new marked.Renderer()

marked.use({
  renderer: {
    code (code, infostring, escaped) {
      let rawHtml = defaultMarkedRenderer.code(code, infostring, escaped)
      // Add a tabindex to the <pre> element, to allow keyboard focus / scrolling
      rawHtml = rawHtml.replace('<pre>', '<pre tabindex="0">')
      return rawHtml
    }
  }
})

const scripts = []
if (existsSync(path.join(projectDir, 'app', 'assets', 'javascripts', 'application.js'))) {
  scripts.push('/public/javascripts/application.js')
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
  if (fs.existsSync(filtersPath)) {
    additionalFilters.push(filtersPath)
  }
  const filterFiles = plugins.getFileSystemPaths('nunjucksFilters').concat(additionalFilters)
  filterFiles.forEach(x => require(x))
}

// Require core and custom functions, merges to one object
// and then add the methods to Nunjucks environment
function addNunjucksFunctions (env) {
  functions.setEnvironment(env)
  const additionalFunctions = []
  const functionsPath = path.join(appDir, 'functions.js')
  if (fs.existsSync(functionsPath)) {
    additionalFunctions.push(functionsPath)
  }
  const globalFiles = plugins.getFileSystemPaths('nunjucksFunctions').concat(additionalFunctions)
  globalFiles.forEach(x => require(x))
}

function addRouters (app) {
  routes.setApp(app)
  const routesPath = path.join(appDir, 'routes.js')
  if (fs.existsSync(routesPath)) {
    require(routesPath)
  }
}

// Find an available port to run the server on
function findAvailablePort (callback) {
  let port = config.port

  console.log('')

  // Check port is free, else offer to change
  portScanner.findAPortNotInUse(port, port + 50, '127.0.0.1', (error, availablePort) => {
    if (error) { throw error }
    if (port === availablePort) {
      // Port is free, return it via the callback
      callback(port)
    } else {
      // Port in use - offer to change to available port
      console.error('ERROR: Port ' + port + ' in use - you may have another prototype running.\n')

      // Ask user if they want to change port
      inquirer.prompt([{
        name: 'changePort',
        message: 'Change to an available port?',
        type: 'confirm'
      }]).then(answers => {
        if (answers.changePort) {
          // User answers yes
          port = availablePort

          console.log('Changed to port ' + port)
          console.log('')

          callback(port)
        } else {
          // User answers no - exit
          process.exit(0)
        }
      })
    }
  })
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
  const fileExists = fs.existsSync(filename)
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
    const dirContents = fs.readdirSync(fullPath)
    return dirContents.map(item => {
      const lstat = fs.lstatSync(path.join(fullPath, item))
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
  const files = await fsp.readdir(dir)
  const modifiedFiles = await asyncSeriesMap(files, async file => {
    const filePath = path.join(dir, file)
    const fileStat = await fsp.stat(filePath)

    if (fileStat.isDirectory()) {
      return await searchAndReplaceFiles(filePath, searchText, replaceText, extensions)
    } else if (extensions.some(extension => file.endsWith(extension))) {
      let fileContent = await fsp.readFile(filePath, 'utf8')
      if (fileContent.includes(searchText)) {
        fileContent = fileContent.replace(new RegExp(searchText, 'g'), replaceText)
        await fsp.writeFile(filePath, fileContent)
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
  sortByObjectKey
}
