var path = require('path'),
    express = require('express'),
    nunjucks = require('express-nunjucks'),
    favicon = require('serve-favicon'),
    basicAuth = require('basic-auth-connect'),
    bodyParser = require('body-parser'),
    port = (process.env.PORT || 3000),
    app = express(),

    // routing and extras
    routes        = require(__dirname + '/lib/default-routes.js'),
    app_routes    = require(__dirname + '/app/routes.js'),

// Grab environment variables specified in Procfile or as Heroku config vars
    username = process.env.USERNAME,
    password = process.env.PASSWORD,
    env = process.env.NODE_ENV || 'development';

// Authenticate against the environment-provided credentials, if running
// the app in production (Heroku, effectively)
if (env === 'production') {
  if (!username || !password) {
    console.log('Username or password is not set, exiting.');
    process.exit(1);
  }
  app.use(basicAuth(username, password));
}

// Setting up the templating system, nunjucks etc.
app.set('view engine', 'html');
app.set('views', [__dirname + '/app/views/', __dirname + '/lib/']);
nunjucks.setup({
    autoescape: true,
    watch: true,
    noCache: true
}, app);

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

// Routers
if (typeof(routes) != "function") {
  console.log(routes.bind);
  console.log("Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.")
  routes.bind(app);
} else {
  console.log('Using routes');
  app.use(app_routes);    // these have to come first.
  app.use(routes);        // these come last because they mop up!
}

app.listen(port);
console.log('');
console.log('Listening on port ' + port);
console.log('');
