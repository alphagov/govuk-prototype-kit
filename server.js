var path = require('path'),
    express = require('express'),
    nunjucks = require('express-nunjucks'),
    routes = require(__dirname + '/app/routes.js'),
    favicon = require('serve-favicon'),
    app = express(),
    basicAuth = require('basic-auth'),
    bodyParser = require('body-parser'),
    config = require(__dirname + '/app/config.js'),
    port = (process.env.PORT || config.port),
    utils = require(__dirname + '/lib/utils.js'),
    packageJson = require(__dirname + '/package.json'),

// Grab environment variables specified in Procfile or as Heroku config vars
    releaseVersion = packageJson.version;
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

// Application settings
app.set('view engine', 'html');
app.set('views', [__dirname + '/app/views', __dirname + '/lib/']);

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

// Add variables that are available in all views
app.use(function (req, res, next) {
  res.locals.serviceName=config.serviceName;
  res.locals.cookieText=config.cookieText;
  res.locals.releaseVersion="v" + releaseVersion;
  next();
});

// Disallow search index idexing
app.use(function (req, res, next) {
  // Setting headers stops pages being indexed even if indexed pages link to them.
  res.setHeader('X-Robots-Tag', 'noindex');
  next();
});

app.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /");
});

// routes (found in app/routes.js)
if (typeof(routes) != "function"){
  console.log(routes.bind);
  console.log("Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.")
  routes.bind(app);
} else {
  app.use("/", routes);
}

// Strip .html and .htm if provided
app.get(/\.html?$/i, function (req, res){
  var path = req.path;
  var parts = path.split('.');
  parts.pop();
  path = parts.join('.');
  res.redirect(path);
});

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

console.log("\nGOV.UK Prototype kit v" + releaseVersion);
// Display warning not to use kit for production services.
console.log("\nNOTICE: the kit is for building prototypes, do not use it for production services.");

// start the app
utils.findAvailablePort(app);
