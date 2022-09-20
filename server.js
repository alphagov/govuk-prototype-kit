// Core dependencies
const path = require('path')
const url = require('url')
const os = require('os')
const fs = require('fs').promises

// NPM dependencies
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const express = require('express')
const nunjucks = require('nunjucks')

// Run before other code to make sure variables from .env are available
dotenv.config()

// Local dependencies
const { projectDir, packageDir } = require('./lib/path-utils')
const utils = require('./lib/utils.js')
const extensions = require('./lib/extensions/extensions.js')
const routesApi = require('./lib/routes/api.js')
const { getConfig } = require('./lib/config')
const middlewareFunctions = []

// process.on('warning', e => console.warn(e.stack))

const app = express()
routesApi.setApp(app)

// Force HTTPS on production. Do this before using basicAuth to avoid
// asking for username/password twice (for `http`, then `https`).
if (getConfig().isSecure) {
  app.use(utils.forceHttps)
  app.set('trust proxy', 1) // needed for secure cookies on heroku
}

// use cookie middleware for reading authentication cookie
app.use(cookieParser())

// Authentication middleware must be loaded before other middleware such as
// static assets to prevent unauthorised access

// Set up App
var appViews = extensions.getAppViews([
  path.join(projectDir, '/app/views/')
])

if (process.env.IS_INTEGRATION_TEST) {
  appViews.push(path.join(packageDir, 'lib', 'nunjucks'))
  appViews.push(path.join(packageDir, 'prototype-starter', 'app', 'views'))
}

var nunjucksConfig = {
  autoescape: true,
  noCache: true,
  watch: false // We are now setting this to `false` (it's by default false anyway) as having it set to `true` for production was making the tests hang
}

if (getConfig().isDevelopment) {
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

// Prevent search indexing
app.use(function (req, res, next) {
  // Setting headers stops pages being indexed even if indexed pages link to them.
  res.setHeader('X-Robots-Tag', 'noindex')
  next()
})

require('./lib/routes/passwordRoutes')
require('./lib/routes/managePrototypeRoutes')
require('./lib/routes/extensions')
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
app.get(/^([^.]+)$/, middlewareFunctions, async function (req, res, next) {
  await utils.matchRoutes(req, res, next)
})

console.log(middlewareFunctions.map(x => x.toString().substr(0, 100)))

// Redirect all POSTs to GETs - this allows users to use POST for autoStoreData
app.post(/^\/([^.]+)$/, middlewareFunctions, function (req, res) {
  res.redirect(url.format({
    pathname: '/' + req.params[0],
    query: req.query
  })
  )
})

// redirect old local docs to the docs site
app.get('/docs/tutorials-and-examples', function (req, res) {
  res.redirect('https://govuk-prototype-kit.herokuapp.com/docs')
})

app.get('/', async (req, res) => {
  const starterHomepageCode = await fs.readFile(path.join(packageDir, 'prototype-starter', 'app', 'views', 'index.html'), 'utf8')
  res.render('govuk-prototype-kit/backup-homepage', {
    starterHomepageCodeLines: starterHomepageCode.split(os.EOL)
  })
})

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(packageDir, 'lib', 'assets', 'images', 'unbranded.ico'))
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
  if (err.status !== 404) {
    console.error(err.stack)
  }
  res.status(err.status || 500)
  res.send(err.message)
})

module.exports = app
