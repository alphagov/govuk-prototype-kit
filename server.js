// Core dependencies
const path = require('path')
const url = require('url')
const { existsSync } = require('fs')
const fs = require('fs').promises

// NPM dependencies
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
const middlewareFunctions = [
  require('./lib/middleware/authentication/authentication.js')()
]
const { projectDir, packageDir } = require('./lib/path-utils')
const config = require('./lib/config.js').getConfig()
const packageJson = require('./package.json')
const utils = require('./lib/utils.js')
const sessionUtils = require('./lib/sessionUtils.js')
const extensions = require('./lib/extensions/extensions.js')
const routesApi = require('./lib/routes/api.js')

const app = express()
routesApi.setApp(app)

// Set up configuration variables
var releaseVersion = packageJson.version

// Force HTTPS on production. Do this before using basicAuth to avoid
// asking for username/password twice (for `http`, then `https`).
var isSecure = (config.isProduction && config.useHttps)
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
if (extensions.legacyGovukFrontendFixesNeeded()) {
  app.locals.GOVUKPrototypeKit.legacyGovukFrontendFixesNeeded = true
}
// extensionConfig sets up variables used to add the scripts and stylesheets to each page.
const scripts = []
if (existsSync(path.join(projectDir, 'app', 'assets', 'javascripts', 'application.js'))) {
  scripts.push('/public/javascripts/application.js')
}
if (extensions.legacyGovukFrontendFixesNeeded()) {
  scripts.push('/extension-assets/govuk-prototype-kit/lib/assets/javascripts/optional/legacy-govuk-frontend-init.js')
}
app.locals.extensionConfig = extensions.getAppConfig({
  scripts: scripts
})

// use cookie middleware for reading authentication cookie
app.use(cookieParser())

// Support session data storage
middlewareFunctions.push(sessionUtils.getSessionMiddleware())

// Authentication middleware must be loaded before other middleware such as
// static assets to prevent unauthorised access
middlewareFunctions.forEach(func => app.use(func))

// Set up App
var appViews = [
  path.join(projectDir, '/app/views/')
].concat(extensions.getAppViews())

var nunjucksConfig = {
  autoescape: true,
  noCache: true,
  watch: false // We are now setting this to `false` (it's by default false anyway) as having it set to `true` for production was making the tests hang
}

if (config.isDevelopment) {
  nunjucksConfig.watch = true
}

nunjucksConfig.express = app

var nunjucksAppEnv = nunjucks.configure(appViews, nunjucksConfig)

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
app.use(function (req, res, next) {
  // Setting headers stops pages being indexed even if indexed pages link to them.
  res.setHeader('X-Robots-Tag', 'noindex')
  next()
})

require('./lib/routes/prototype-admin-routes.js')
require('./lib/routes/extensions.js')
utils.addRouters(app)

app.get('/robots.txt', function (req, res) {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

// Strip .html and .htm if provided
app.get(/\.html?$/i, function (req, res) {
  var path = req.path
  var parts = path.split('.')
  parts.pop()
  path = parts.join('.')
  res.redirect(path)
})

// Auto render any view that exists

// App folder routes get priority
app.get(/^([^.]+)$/, function (req, res, next) {
  utils.matchRoutes(req, res, next)
})

// Redirect all POSTs to GETs - this allows users to use POST for autoStoreData
app.post(/^\/([^.]+)$/, function (req, res) {
  res.redirect(url.format({
    pathname: '/' + req.params[0],
    query: req.query
  })
  )
})

// redirect old local docs to the docs site
app.get('/docs/tutorials-and-examples', function (req, res) {
  res.redirect('https://prototype-kit.service.gov.uk/docs')
})

app.get('/', async (req, res) => {
  const starterHomepageCode = await fs.readFile(path.join(packageDir, 'prototype-starter', 'app', 'views', 'index.html'), 'utf8')
  res.render('govuk-prototype-kit/backup-homepage', {
    starterHomepageCodeLines: starterHomepageCode.split('\n')
  })
})

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error(`Page not found: ${req.path}`)
  err.status = 404
  next(err)
})

// Display error
app.use(function (err, req, res, next) {
  console.error(err.message)
  res.status(err.status || 500)
  res.send(err.message)
})

module.exports = app
