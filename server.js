// Modules and middleware

var path = require('path'),
    express = require('express'),
    nunjucks = require('nunjucks'),
    routes = require(__dirname + '/app/routes.js'),
    docsRoutes = require(__dirname + '/docs/routes.js'),
    favicon = require('serve-favicon'),
    app = express(),
    docsApp = express(),
    basicAuth = require('basic-auth'),
    bodyParser = require('body-parser'),
    config = require(__dirname + '/app/config.js'),
    port = (process.env.PORT || config.port),
    utils = require(__dirname + '/lib/utils.js');

// Environment variables
var env      = process.env.NODE_ENV || 'development',
    env      = env.toLowerCase();

var username = process.env.USERNAME,
    password = process.env.PASSWORD,

    // Enable or disbale auth in app/config.js or using env variable
    useAuth  = process.env.USE_AUTH || config.useAuth,
    useAuth  = useAuth.toLowerCase();

    // Whether local docs are rendered or not - change in app/config.js
var useDocs  = (config.useDocs == 'true' ) ? true : false,

    // Promo mode redirects / to /docs - so our landing page is the docs when published on heroku
    promoMode = process.env.PROMO_MODE || 'false',
    promoMode = promoMode.toLowerCase();

// Disable promo mode if docs aren't enabled
if (!useDocs) promoMode = 'false';

// Authenticate against the environment-provided credentials, if running
// the app in production (Heroku, effectively)
if (env === 'production' && useAuth === 'true'){
    app.use(utils.basicAuth(username, password));
}

var appViews = [__dirname + '/app/views/', __dirname + '/lib/'];
var docsViews = [__dirname + '/docs/views/', __dirname + '/lib/'];

nunjucks.configure(appViews, {
    autoescape: true,
    express: app,
    noCache: true,
    watch: true
});

nunjucks.configure(docsViews, {
    autoescape: true,
    express: docsApp,
    noCache: true,
    watch: true
});

// Application settings
app.set('view engine', 'html');
docsApp.set('view engine', 'html');

// Middleware to serve static assets
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_template/assets'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit'));
app.use('/public/images/icons', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit/images'));

// TODO: is this the right way to serve these assets?
docsApp.use('/assets/images', express.static(__dirname + '/docs/assets/images'));


// Elements refers to icon folder instead of images folder
app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images','favicon.ico')));

// Support for parsing data in POSTs
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// send assetPath to all views
app.use(function (req, res, next) {
  res.locals.asset_path="/public/";
  next();
});

// Add variables that are available in all views
app.use(function (req, res, next) {
  res.locals.serviceName=config.serviceName;
  res.locals.cookieText=config.cookieText;
  next();
});

// Redirect root to /docs when in promo mode.
if (promoMode == 'true'){
  console.log('Kit running in promo mode');
  app.get('/', function (req, res) {
    res.redirect('/docs');
  });
}

// routes (found in app/routes.js)
if (typeof(routes) != "function"){
  console.log(routes.bind);
  console.log("Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.");
  routes.bind(app);
} else {
  app.use("/", routes);
}

// Downloads returns a url to the zip of the latest release on github
app.get('/prototype-admin/download-latest', function (req, res) {
  url = utils.getLatestRelease();
  res.redirect(url);
});

if (useDocs === true){
  // Create separate router for docs
  app.use("/docs", docsApp);
  // Docs under the /docs namespace
  docsApp.use("/", docsRoutes);
}

// auto render any view that exists

// App folder routes get priority
app.get(/^\/([^.]+)$/, function (req, res) {
  utils.matchRoutes(req, res);
});

// Docs folder routes
if (useDocs){
  docsApp.get(/^\/([^.]+)$/, function (req, res) {
    utils.matchRoutes(req, res);
  });
}

// start the app

utils.findAvailablePort(app);
