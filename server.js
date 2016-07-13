var path = require('path')
var express = require('express')
var session = require('express-session')
var nunjucks = require('express-nunjucks')
var routes = require('./app/routes.js')
var favicon = require('serve-favicon')
var app = express()
var bodyParser = require('body-parser')
var browserSync = require('browser-sync')
var config = require('./app/config.js')
var utils = require('./lib/utils.js')
var packageJson = require(path.join(__dirname, '/package.json'))

// Grab environment variables specified in Procfile or as Heroku config vars
var releaseVersion = packageJson.version
var username = process.env.USERNAME
var password = process.env.PASSWORD
var env = process.env.NODE_ENV || 'development'
var useAuth = process.env.USE_AUTH || config.useAuth
var useHttps = process.env.USE_HTTPS || config.useHttps

env = env.toLowerCase()
useAuth = useAuth.toLowerCase()
useHttps = useHttps.toLowerCase()

// Authenticate against the environment-provided credentials, if running
// the app in production (Heroku, effectively)
if (env === 'production' && useAuth === 'true') {
  app.use(utils.basicAuth(username, password))
}

// Application settings
app.set('view engine', 'html')
app.set('views', [path.join(__dirname, '/app/views'), path.join(__dirname, '/lib/')])

nunjucks.setup({
  autoescape: true,
  watch: true,
  noCache: true
}, app)

// require core and custom filters, merges to one object
// and then add the methods to nunjucks env obj
nunjucks.ready(function (nj) {
  var coreFilters = require(path.join(__dirname, '/lib/core_filters.js'))(nj)
  var customFilters = require(path.join(__dirname, '/app/filters.js'))(nj)
  var filters = Object.assign(coreFilters, customFilters)
  Object.keys(filters).forEach(function (filterName) {
    nj.addFilter(filterName, filters[filterName])
  })
})

// Middleware to serve static assets
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')))
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')))
app.use('/public/images/icons', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit/images')))

// Elements refers to icon folder instead of images folder
app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images', 'favicon.ico')))

// Support for parsing data in POSTs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

// Support session data
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: Math.round(Math.random() * 100000).toString()
}))

// send assetPath to all views
app.use(function (req, res, next) {
  res.locals.asset_path = '/public/'
  next()
})

// Add variables that are available in all views
app.use(function (req, res, next) {
  res.locals.serviceName = config.serviceName
  res.locals.cookieText = config.cookieText
  res.locals.releaseVersion = 'v' + releaseVersion
  next()
})

// Force HTTPs on production connections
if (env === 'production' && useHttps === 'true') {
  app.use(utils.forceHttps)
}

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

// routes (found in app/routes.js)
if (typeof (routes) !== 'function') {
  console.log(routes.bind)
  console.log('Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.')
  routes.bind(app)
} else {
  app.use('/', routes)
}

// Strip .html and .htm if provided
app.get(/\.html?$/i, function (req, res) {
  var path = req.path
  var parts = path.split('.')
  parts.pop()
  path = parts.join('.')
  res.redirect(path)
})

// auto render any view that exists
app.get(/^\/([^.]+)$/, function (req, res) {
  var path = (req.params[0])

  res.render(path, function (err, html) {
    if (err) {
      res.render(path + '/index', function (err2, html) {
        if (err2) {
          console.log(err)
          res.status(404).send(err + '<br>' + err2)
        } else {
          res.end(html)
        }
      })
    } else {
      res.end(html)
    }
  })
})

console.log('\nGOV.UK Prototype kit v' + releaseVersion)
// Display warning not to use kit for production services.
console.log('\nNOTICE: the kit is for building prototypes, do not use it for production services.')

// start the app
utils.findAvailablePort(app, function (port) {
  console.log('Listening on port ' + port + '   url: http://localhost:' + port)
  if (env === 'production') {
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
