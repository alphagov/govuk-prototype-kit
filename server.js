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
    session = require('express-session');

// Grab environment variables specified in Procfile or as Heroku config vars
    releaseVersion = packageJson.version;
    username = process.env.USERNAME,
    password = process.env.PASSWORD,
    env      = process.env.NODE_ENV || 'development',
    useAuth  = process.env.USE_AUTH || config.useAuth;
    useAutoStoreData = config.useAutoStoreData;

    env      = env.toLowerCase();
    useAuth  = useAuth.toLowerCase();
    useAutoStoreData = useAutoStoreData.toLowerCase();

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

// Support for session
app.use(session({
  secret: "prototype-kit",
  resave: false,
  saveUninitialized: false
}));

app.use(function (req, res, next) {

  // send assetPath to all views
  res.locals.asset_path="/public/";

  // Add variables that are available in all views
  res.locals.serviceName=config.serviceName;
  res.locals.cookieText=config.cookieText;
  res.locals.releaseVersion="v" + releaseVersion;

  next();

});

if (useAutoStoreData == 'true'){
  app.use(utils.autoStoreData);
}

// routes (found in app/routes.js)
if (typeof(routes) != "function"){
  console.log(routes.bind);
  console.log("Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.")
  routes.bind(app);
} else {
  app.use("/", routes);
}

app.get('/prototype-admin/clear-data', function(req, res){

  req.session.destroy();

  res.render("prototype-admin/clear-data");

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

// redirect all POSTs to GETs to avoid nasty refresh warning
app.post(/^\/([^.]+)$/, function(req, res){
  res.redirect("/" + req.params[0]);
});

console.log("\nGOV.UK Prototype kit v" + releaseVersion);
// Display warning not to use kit for production services.
console.log("\nNOTICE: the kit is for building prototypes, do not use it for production services.");

// start the app
utils.findAvailablePort(app);
