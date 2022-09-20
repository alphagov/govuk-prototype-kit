// Core dependencies
const https = require('https')
const fs = require('fs')

// NPM dependencies
const { get: getKeypath } = require('lodash')
const { marked } = require('marked')
const path = require('path')
const portScanner = require('portscanner')
const inquirer = require('inquirer')

// Local dependencies
const { appDir, projectDir, packageDir } = require('./path-utils')
const views = require('./views/api')
const routes = require('./routes/api')
const extensions = require('./extensions/extensions')
const requests = require('../index').requests
const sessionInCookie = require('client-sessions')
const { getConfig } = require('./config')
const sessionInMemory = require('express-session')
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

// Require core and custom filters, merges to one object
// and then add the methods to Nunjucks environment
exports.addNunjucksFilters = function (env) {
  views.setEnvironment(env)
  const additionalFilters = []
  const filtersPath = path.join(appDir, 'filters.js')
  if (fs.existsSync(filtersPath)) {
    additionalFilters.push(filtersPath)
  }
  const filterFiles = extensions.getFileSystemPaths('nunjucksFilters').concat(additionalFilters)
  filterFiles.forEach(x => require(x))
}

exports.addRouters = function (app) {
  routes.setApp(app)
  const routesPath = path.join(appDir, 'routes.js')
  if (fs.existsSync(routesPath)) {
    require(routesPath)
  }
}

// Find an available port to run the server on
exports.findAvailablePort = function (app, callback) {
  const portPath = path.join(projectDir, '.port.tmp')
  var port = null

  // When the server starts, we store the port in .port.tmp so it tries to restart
  // on the same port
  try {
    port = Number(fs.readFileSync(portPath))
  } catch (e) {
    port = getConfig().port
  }

  console.log('')

  // Check port is free, else offer to change
  portScanner.findAPortNotInUse(port, port + 50, '127.0.0.1', function (error, availablePort) {
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
          fs.writeFileSync(path.join(portPath), port.toString())
          console.log('Changed to port ' + port)

          callback(port)
        } else {
          // User answers no - exit
          console.log('\nYou can set a new default port in server.js, or by running the server with PORT=XXXX')
          console.log('\nExit by pressing \'ctrl + c\'')
          process.exit(0)
        }
      })
    }
  })
}

// Redirect HTTP requests to HTTPS
exports.forceHttps = function (req, res, next) {
  if (req.protocol !== 'https') {
    console.log('Redirecting request to https')
    // 302 temporary - this is a feature that can be disabled
    return res.redirect(302, 'https://' + req.get('Host') + req.url)
  }

  // Mark proxy as secure (allows secure cookies)
  req.connection.proxySecure = true
  next()
}

const getSessionNameFromServiceName = (serviceName) => {
  return 'govuk-prototype-kit-' + (Buffer.from(serviceName, 'utf8')).toString('hex')
}

exports.getSessionMiddleware = () => {
  // Session uses service name to avoid clashes with other prototypes
  const sessionName = getSessionNameFromServiceName(getConfig().serviceName)
  const sessionHours = 4
  const sessionOptions = {
    secret: sessionName,
    cookie: {
      maxAge: 1000 * 60 * 60 * sessionHours,
      secure: getConfig().isSecure
    }
  }

  // Support session data in cookie or memory
  if (getConfig().useCookieSessionStore) {
    return sessionInCookie(Object.assign(sessionOptions, {
      cookieName: sessionName,
      proxy: true,
      requestKey: 'session'
    }))
  } else {
    return sessionInMemory(Object.assign(sessionOptions, {
      name: sessionName,
      resave: false,
      saveUninitialized: false
    }))
  }
}

// Try to match a request to a template, for example a request for /test
// would look for /app/views/test.html
// and /app/views/test/index.html

async function renderPath (path, res, next) {
  const model = await requests.generateStandardModel()
  if (path === 'index') {
    model.serviceNameFileLocation = 'app/config.json'
  }
  // Try to render the path
  res.render(path, model, async function (error, html) {
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
    if (!path.endsWith('/index')) {
      // Maybe it's a folder - try to render [path]/index.html
      await renderPath(path + '/index', res, next)
      return
    }
    // We got template not found both times - call next to trigger the 404 page
    next()
  })
}

exports.matchRoutes = async function (req, res, next) {
  var path = req.path

  // Remove the first slash, render won't work with it
  path = path.substr(1)

  // If it's blank, render the root index
  if (path === '') {
    path = 'index'
  }

  await renderPath(path, res, next)
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

exports.sleep = sleep

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

exports.waitUntilFileExists = waitUntilFileExists
// Store data from POST body or GET query in session

exports.requestHttpsJson = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    const dataParts = []

    const statusCode = res.statusCode
    if (statusCode < 200 || statusCode >= 300) {
      const error = new Error(`Bad response from [${url}]`)
      error.statusCode = statusCode
      error.code = 'EBADRESPONSE'
      reject(error)
    }
    res.on('end', () => {
      resolve(JSON.parse(dataParts.join('')))
    })
    res.on('data', (d) => {
      dataParts.push(d)
    })
  }).on('error', (e) => {
    reject(e)
  })
})
