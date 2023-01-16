// core dependencies
const fs = require('fs').promises
const path = require('path')
const url = require('url')

// npm dependencies
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const express = require('express')
const nunjucks = require('nunjucks')

// We want users to be able to keep api keys, config variables and other
// envvars in a `.env` file, run dotenv before other code to make sure those
// variables are available
dotenv.config()

// Local dependencies
const { projectDir, packageDir } = require('./lib/utils/paths')
const config = require('./lib/config.js').getConfig()
const packageJson = require('./package.json')
const utils = require('./lib/utils')
const sessionUtils = require('./lib/session.js')
const plugins = require('./lib/plugins/plugins.js')
const routesApi = require('./lib/routes/api.js')

const app = express()
routesApi.setApp(app)

// Set up configuration variables
const releaseVersion = packageJson.version

// Force HTTPS on production. Do this before using basicAuth to avoid
// asking for username/password twice (for `http`, then `https`).
const isSecure = (config.isProduction && config.useHttps)
if (isSecure) {
  app.use(utils.forceHttps)
  app.set('trust proxy', 1) // needed for secure cookies on heroku
}

// Add variables that are available in all views
app.locals.asset_path = '/public/'
app.locals.useAutoStoreData = config.useAutoStoreData
app.locals.releaseVersion = 'v' + releaseVersion
app.locals.serviceName = config.serviceName
app.locals.GOVUKPrototypeKit = {
  isProduction: config.isProduction,
  isDevelopment: config.isDevelopment
}
if (plugins.legacyGovukFrontendFixesNeeded()) {
  app.locals.GOVUKPrototypeKit.legacyGovukFrontendFixesNeeded = true
}
// pluginConfig sets up variables used to add the scripts and stylesheets to each page.
app.locals.pluginConfig = plugins.getAppConfig({
  scripts: utils.prototypeAppScripts
})
// keep extensionConfig around for backwards compatibility
// TODO: remove in v14
app.locals.extensionConfig = app.locals.pluginConfig

// use cookie middleware for reading authentication cookie
app.use(cookieParser())

// Authentication middleware must be loaded before other middleware such as
// static assets to prevent unauthorised access
app.use(require('./lib/authentication.js')())

// Support session data storage
app.use(sessionUtils.getSessionMiddleware())

// Set up App
const appViews = [
  path.join(projectDir, '/app/views/')
].concat(plugins.getAppViews())

console.log(appViews)

const nunjucksConfig = {
  autoescape: true,
  noCache: true,
  watch: false // We are now setting this to `false` (it's by default false anyway) as having it set to `true` for production was making the tests hang
}

if (config.isDevelopment) {
  nunjucksConfig.watch = true
}

nunjucksConfig.express = app

const nunjucksAppEnv = nunjucks.configure(appViews, nunjucksConfig)

// Add Nunjucks filters
utils.addNunjucksFilters(nunjucksAppEnv)

// Set views engine
app.set('view engine', 'html')

// Middleware to serve static assets
app.use('/public', express.static(path.join(projectDir, '.tmp', 'public')))
app.use('/public', express.static(path.join(projectDir, 'app', 'assets')))

// Support for parsing data in POSTs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

// Automatically store all data users enter
if (config.useAutoStoreData) {
  app.use(sessionUtils.autoStoreData)
  sessionUtils.addCheckedFunction(nunjucksAppEnv)
}

// Prevent search indexing
app.use((req, res, next) => {
  // Setting headers stops pages being indexed even if indexed pages link to them.
  res.setHeader('X-Robots-Tag', 'noindex')
  next()
})

require('./lib/manage-prototype-routes.js')
require('./lib/plugins/plugins-routes.js')
utils.addRouters(app)

app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

// Strip .html and .htm if provided
app.get(/\.html?$/i, (req, res) => {
  let path = req.path
  const parts = path.split('.')
  parts.pop()
  path = parts.join('.')
  res.redirect(path)
})

// Auto render any view that exists

// App folder routes get priority
app.get(/^([^.]+)$/, (req, res, next) => {
  utils.matchRoutes(req, res, next)
})

// Redirect all POSTs to GETs - this allows users to use POST for autoStoreData
app.post(/^\/([^.]+)$/, (req, res) => {
  res.redirect(url.format({
      pathname: '/' + req.params[0],
      query: req.query
    })
  )
})

// redirect old local docs to the docs site
app.get('/docs/tutorials-and-examples', (req, res) => {
  res.redirect('https://prototype-kit.service.gov.uk/docs')
})

app.get('/', async (req, res) => {
  const starterHomepageCode = await fs.readFile(path.join(packageDir, 'prototype-starter', 'app', 'views', 'index.html'), 'utf8')
  res.render('views/backup-homepage', {
    starterHomepageCode
  })
})

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error(`Page not found: ${decodeURI(req.path)}`)
  err.status = 404
  next(err)
})

// Display error
// We override the default handler because we want to customise
// how the error appears to users, we want to show a simplified
function formatForNunjucksSafe (input) {
  return input.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/  /g, '&nbsp;&nbsp;').split('\n').map((x, index) => `<div class="line-${index + 1} code-line"><span class="line-number">${index + 1}</span>${x}</div>`).join('\n')
}

async function displayNiceError (filePath, line, message, res, column) {
  const pathFromAppRoot = path.relative(projectDir, filePath)
  let codeArea = 'This is an error in your code'

  if (pathFromAppRoot.startsWith('node_modules')) {
    const pluginName = pathFromAppRoot.split('/')[1]
    codeArea = `This error comes from the "${pluginName}" plug-in. Please contact them to report the issue.  This is not an error in your code but you might be able to change your code to work around it.`
  }

  const originalFileContents = await fs.readFile(filePath, 'utf8')

  const fileContents = formatForNunjucksSafe(originalFileContents)
  const highlightLines = []
  if (line && column) {

    const rawLines = originalFileContents.split('\n')

    highlightLines.push(line)
    if (message.startsWith('unexpected token') || message.endsWith('expected')) {
      let currentLine = line
      do {
        currentLine--
        highlightLines.push(Number(currentLine))
      } while (rawLines[currentLine - 1].replace(/\s/g, '').length === 0)
    }
  }
  return res.render('govuk-prototype-kit/useful/error-page-nunjucks', {
    pathFromAppRoot,
    codeArea,
    fileContents,
    highlightLines: highlightLines,
    column,
    message
  })
}

// message without the stack trace.
app.use(async (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(err.status || 500)
  const input = err.stack
  const formattedStack = formatForNunjucksSafe(input)
  const nunjucksMatcherWithLineAndColumn = /\((\/[^)]+)\) \[Line (\d+), Column (\d+)]\s+(.+)$/
  const nunjucksMatchesWithLineAndColumn = nunjucksMatcherWithLineAndColumn.exec(err.message)
  if (nunjucksMatchesWithLineAndColumn) {
    console.log(err.message)
    const [, filePath, line, column, message] = nunjucksMatchesWithLineAndColumn
    return await displayNiceError(filePath, line, message, res, column)
  }
  const nunjucksMatcher = /\((\/[^)]+)\)\s+(.+)$/
  const nunjucksMatches = nunjucksMatcher.exec(err.message)
  if (nunjucksMatches) {
    const [, filePath, message] = nunjucksMatches
    return await displayNiceError(filePath, undefined, message, res, undefined)
  }
  const [stackLine1, stackLine2] = err.stack.split('\n')
  const stackLine2Matcher = /^\s*at (\/[^:]+):(\d+):(\d+)$/
  const stackLine2Matches = stackLine2Matcher.exec(stackLine2)
  if (stackLine2Matches) {
    const [, filePath, line, column] = stackLine2Matches
    return await displayNiceError(filePath, line, stackLine1, res, column)
  }
  res.render('govuk-prototype-kit/useful/error-page', {
    message: err.message,
    stack: formattedStack
  })
})

module.exports = app
