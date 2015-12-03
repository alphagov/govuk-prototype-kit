var path  = require('path'),
    express = require('express'),
    routes = require(__dirname + '/app/routes.js'),
    favicon = require('serve-favicon'),
    app = express(),
    basicAuth = require('basic-auth'),
    bodyParser = require('body-parser'),
    port = (process.env.PORT || 3000),
    utils = require(__dirname + '/lib/utils.js'),
    prompt = require('prompt'),
    portScanner = require('portscanner'),

// Grab environment variables specified in Procfile or as Heroku config vars
    username = process.env.USERNAME,
    password = process.env.PASSWORD,
    env      = process.env.NODE_ENV || 'development',
    useAuth  = process.env.USE_AUTH || 'true';

    env      = env.toLowerCase();
    useAuth  = useAuth.toLowerCase();


// Authenticate against the environment-provided credentials, if running
// the app in production (Heroku, effectively)
if (env === 'production' && useAuth === 'true'){
    app.use(utils.basicAuth(username, password));
}

// Application settings
app.engine('html', require(__dirname + '/lib/template-engine.js').__express);
app.set('view engine', 'html');
app.set('vendorViews', __dirname + '/govuk_modules/govuk_template/views/layouts');
app.set('views', path.join(__dirname, '/app/views'));

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
  res.locals.assetPath="/public/";
  next();
});

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
      console.log(err);
      res.sendStatus(404);
    } else {
      res.end(html);
    }
  });

});

// start the app

console.log('');
// Check that default port is free, else offer to change
portScanner.findAPortNotInUse(port, port+50, '127.0.0.1', function(error, availablePort) {

  if (port == availablePort){
    app.listen(port);
    console.log('Listening on port ' + port + '   url: http://localhost:' + port);
  }
  else {
    // Default port in use - offer to change to available port
    console.log("ERROR: Port " + port + " in use - do you have another prototype running?\n");
    // Set up prompt settings
    prompt.colors = false;
    prompt.start();
    prompt.message = "";
    prompt.delimiter = "";

    // Ask user if they want to change port
    prompt.get([{
      name: 'answer',
      description: 'Change to an available port? (y/n)',
      required: true,
      type: 'string',
      pattern: /y(es)?|no?/i,
      message: 'Please enter y or n'
    }], function (err, result) {
      if (result.answer.match(/y(es)?/i) ) {
        // User answers yes
        port = availablePort;
        app.listen(port);
        console.log('Changed to port ' + port + '   url: http://localhost:' + port);
      }
      else {
        // User answers no - exit
        console.log('You can set a new default port in server.js, or by running the server with PORT=XXXX');
        console.log("Exiting");
        process.exit(0);
      }
    });
  }
});

