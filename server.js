// core dependencies
const fs = require('fs').promises
const path = require('path')
const url = require('url')

// npm dependencies
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const express = require('express')
const { expressNunjucks, getNunjucksAppEnv } = require('./lib/nunjucks/nunjucksConfiguration')

// We want users to be able to keep api keys, config variables and other
// envvars in a `.env` file, run dotenv before other code to make sure those
// variables are available
dotenv.config()

// Local dependencies
const { projectDir, packageDir, backupNunjucksDir, finalBackupNunjucksDir } = require('./lib/utils/paths')
const config = require('./lib/config.js').getConfig()
const packageJson = require('./package.json')
const utils = require('./lib/utils')
const sessionUtils = require('./lib/session.js')
const plugins = require('./lib/plugins/plugins.js')
const routesApi = require('./lib/routes/api.js')

const app = express()

// let lastTimestamp = Date.now()

// setInterval(() => {
//   const currentDate = Date.now()
//   const difference = currentDate - lastTimestamp
//   if (difference >= 340) console.log(difference)
//   lastTimestamp = currentDate
// }, 300)

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

const nunjucksConfig = {
  autoescape: true,
  noCache: true,
  watch: false // We are now setting this to `false` (it's by default false anyway) as having it set to `true` for production was making the tests hang
}

if (config.isDevelopment) {
  nunjucksConfig.watch = true
}

nunjucksConfig.express = app

const nunjucksAppEnv = getNunjucksAppEnv(appViews)

expressNunjucks(nunjucksAppEnv, app)

// Add Nunjucks filters
utils.addNunjucksFilters(nunjucksAppEnv)

// Add Nunjucks functions
utils.addNunjucksFunctions(nunjucksAppEnv)

// Set views engine
app.set('view engine', 'njk')

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

// Strip .html, .htm and .njk if provided
app.get(/\.(html|htm|njk)$/i, (req, res) => {
  let path = req.path
  const parts = path.split('.')
  parts.pop()
  path = parts.join('.')
  res.redirect(path)
})

// Auto render any view that exists

// App folder routes get priority
app.get(/^([^.]+)$/, async (req, res, next) => {
  await utils.matchRoutes(req, res, next)
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
  const starterHomepageCode = await fs.readFile(path.join(packageDir, 'prototype-starter', 'app', 'views', 'index.njk'), 'utf8')
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
// message without the stack trace.
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  console.error(err.message)
  res.status(err.status || 500)
  res.send(err.message)
})

module.exports = app
