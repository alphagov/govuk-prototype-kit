var path = require('path'),
    express = require('express'),
    // nunjucks = require('express-nunjucks'),
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
    utils = require(__dirname + '/lib/utils.js'),

// Grab environment variables specified in Procfile or as Heroku config vars
    username = process.env.USERNAME,
    password = process.env.PASSWORD,
    env      = process.env.NODE_ENV || 'development',
    useAuth  = process.env.USE_AUTH || config.useAuth;

    env      = env.toLowerCase();
    useAuth  = useAuth.toLowerCase();

// Authenticate against the environment-provided credentials, if running
// the app in production (Heroku, effectively)
if (env === 'production' && useAuth === 'true'){
    app.use(utils.basicAuth(username, password));
}

var appViews = [__dirname + '/app/views', __dirname + '/lib/'];
var docsViews = [__dirname + '/docs/views', __dirname + '/lib/'];

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

// Create separate router for docs
// var docs = new express.Router()
app.use("/docs", docsApp);

// Docs under the /docs namespace
docsApp.use("/", docsRoutes);


// docs_app.set('views', [__dirname + '/lib/', __dirname + '/docs/views']);

// routes (found in app/routes.js)
if (typeof(routes) != "function"){
  console.log(routes.bind);
  console.log("Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.")
  routes.bind(app);
} else {
  app.use("/", routes);
}

// auto render any view that exists
app.get(/^\/([^.]+)$/, function (req, res) {

  var path = (req.params[0]);

  res.render(path, function(err, html) {
    if (err) {
      res.render(path + "/index", function(err2, html) {
        if (err2) {
          console.log(err);
          res.status(404).send(err + "<br>" + err2);
        } else {
          res.end(html);
        }
      });
    } else {
      res.end(html);
    }
  });

});

// start the app

utils.findAvailablePort(app);
