// built in modules
const crypto = require('crypto')
const path = require('path')

// other modules
const bodyParser = require('body-parser')
const browserSync = require('browser-sync')
const dotenv = require('dotenv')
const express = require('express')
const favicon = require('serve-favicon')
const nunjucks = require('nunjucks')
const session = require('express-session')

// prototype kit code
const config = require('./app/config.js')
const documentationRoutes = require('./docs/documentation_routes.js')
const packageJson = require('./package.json')
const routes = require('./app/routes.js')
const utils = require('./lib/utils.js')

const app = express()
const documentationApp = express()
dotenv.config()

// Grab environment variables specified in Procfile or as Heroku config vars
var releaseVersion = packageJson.version
var username = process.env.USERNAME
var password = process.env.PASSWORD
var env = process.env.NODE_ENV || 'development'
var useAuth = process.env.USE_AUTH || config.useAuth
var useAutoStoreData = process.env.USE_AUTO_STORE_DATA || config.useAutoStoreData
var useHttps = process.env.USE_HTTPS || config.useHttps
var useBrowserSync = config.useBrowserSync
var analyticsId = process.env.ANALYTICS_TRACKING_ID

env = env.toLowerCase()
useAuth = useAuth.toLowerCase()
useHttps = useHttps.toLowerCase()
useBrowserSync = useBrowserSync.toLowerCase()

var useDocumentation = (config.useDocumentation === 'true')

// Promo mode redirects the root to /docs - so our landing page is docs when published on heroku
var promoMode = process.env.PROMO_MODE || 'false'
promoMode = promoMode.toLowerCase()

// Disable promo mode if docs aren't enabled
if (!useDocumentation) promoMode = 'false'

// Force HTTPs on production connections. Do this before asking for basicAuth to
// avoid making users fill in the username/password twice (once for `http`, and
// once for `https`).

var isSecure = (env === 'production' && useHttps === 'true')

if (isSecure) {
  app.use(utils.forceHttps)
  app.set('trust proxy', 1) // needed for secure cookies on heroku
}

// Authenticate against the environment-provided credentials, if running
// the app in production (Heroku, effectively)
if (env === 'production' && useAuth === 'true') {
  app.use(utils.basicAuth(username, password))
}

// Set up App
var appViews = [path.join(__dirname, '/app/views/'), path.join(__dirname, '/lib/')]

var nunjucksAppEnv = nunjucks.configure(appViews, {
  autoescape: true,
  express: app,
  noCache: true,
  watch: true
})

// Nunjucks filters
utils.addNunjucksFilters(nunjucksAppEnv)

// Set views engine
app.set('view engine', 'html')

// Middleware to serve static assets
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')))
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')))
app.use('/public/images/icons', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit/images')))

// Elements refers to icon folder instead of images folder
app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images', 'favicon.ico')))

// Set up documentation app
if (useDocumentation) {
  var documentationViews = [path.join(__dirname, '/docs/views/'), path.join(__dirname, '/lib/')]

  var nunjucksDocumentationEnv = nunjucks.configure(documentationViews, {
    autoescape: true,
    express: documentationApp,
    noCache: true,
    watch: true
  })
  // Nunjucks filters
  utils.addNunjucksFilters(nunjucksDocumentationEnv)

  // Set views engine
  documentationApp.set('view engine', 'html')
}

// Support for parsing data in POSTs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

// Add variables that are available in all views
app.locals.analyticsId = analyticsId
app.locals.asset_path = '/public/'
app.locals.useAutoStoreData = (useAutoStoreData === 'true')
app.locals.cookieText = config.cookieText
app.locals.promoMode = promoMode
app.locals.releaseVersion = 'v' + releaseVersion
app.locals.serviceName = config.serviceName

// Support session data
app.use(session({
  cookie: {
    maxAge: 1000 * 60 * 60 * 4, // 4 hours
    secure: isSecure
  },
  // use random name to avoid clashes with other prototypes
  name: 'govuk-prototype-kit-' + crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  secret: crypto.randomBytes(64).toString('hex')
}))

if (useAutoStoreData === 'true') {
  app.use(utils.autoStoreData)
  utils.addCheckedFunction(nunjucksAppEnv)
  utils.addCheckedFunction(nunjucksDocumentationEnv)
}

app.get('/prototype-admin/clear-data', function (req, res) {
  req.session.destroy()
  res.render('prototype-admin/clear-data')
})

// Redirect root to /docs when in promo mode.
if (promoMode === 'true') {
  console.log('Prototype kit running in promo mode')

  app.get('/', function (req, res) {
    res.redirect('/docs')
  })

  // allow search engines to index the prototype kit promo site
  app.get('/robots.txt', function (req, res) {
    res.type('text/plain')
    res.send('User-agent: *\nAllow: /')
  })
} else {
  // Disallow search index idexing
  app.use(function (req, res, next) {
    // Setting headers stops pages being indexed even if indexed pages link to them.
    res.setHeader('X-Robots-Tag', 'noindex')
    next()
  })

  app.get('/robots.txt', function (req, res) {
    res.type('text/plain')
    res.send('User-agent: *\nDisallow: /')
  })
}

// routes (found in app/routes.js)
if (typeof (routes) !== 'function') {
  console.log(routes.bind)
  console.log('Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.')
  routes.bind(app)
} else {
  app.use('/', routes)
}

// Returns a url to the zip of the latest release on github
app.get('/prototype-admin/download-latest', function (req, res) {
  var url = utils.getLatestRelease()
  res.redirect(url)
})

if (useDocumentation) {
  // Copy app locals to documentation app locals
  documentationApp.locals = app.locals

  // Create separate router for docs
  app.use('/docs', documentationApp)

  // Docs under the /docs namespace
  documentationApp.use('/', documentationRoutes)
}

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
app.get(/^\/([^.]+)$/, function (req, res) {
  utils.matchRoutes(req, res)
})

if (useDocumentation) {
  // Documentation  routes
  documentationApp.get(/^\/([^.]+)$/, function (req, res) {
    if (!utils.matchMdRoutes(req, res)) {
      utils.matchRoutes(req, res)
    }
  })
}

// redirect all POSTs to GETs - this allows users to use POST for autoStoreData
app.post(/^\/([^.]+)$/, function (req, res) {
  res.redirect('/' + req.params[0])
})

console.log('\nGOV.UK Prototype kit v' + releaseVersion)
// Display warning not to use kit for production services.
console.log('\nNOTICE: the kit is for building prototypes, do not use it for production services.')

// start the app
utils.findAvailablePort(app, function (port) {
  console.log('Listening on port ' + port + '   url: http://localhost:' + port)
  if (env === 'production' || useBrowserSync === 'false') {
    app.listen(port)
  } else {
    app.listen(port - 50, function () {
      browserSync({
        proxy: 'localhost:' + (port - 50),
        port: port,
        ui: false,
        files: ['public/**/*.*', 'app/views/**/*.*'],
        ghostmode: false,
        open: false,
        notify: false,
        logLevel: 'error'
      })
    })
  }
})

module.exports = app
