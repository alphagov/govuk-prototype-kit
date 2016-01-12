var path  = require('path'),
    express = require('express'),
    routes = require(__dirname + '/app/routes.js'),
    form = require(__dirname + '/app/middleware/form'),
    favicon = require('serve-favicon'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express(),
    bodyParser = require('body-parser'),
    port = (process.env.PORT || 3000),
    utils = require(__dirname + '/lib/utils.js'),

// Grab environment variables specified in Procfile or as Heroku config vars
    username = process.env.USERNAME,
    password = process.env.PASSWORD,
    env      = process.env.NODE_ENV || 'development',
    useAuth  = process.env.USE_AUTH || 'true',
    cookieSecret = process.env.COOKIE_SECRET || String(Date.now()),
    sessionSecret = process.env.SESSION_SECRET || String(Date.now());

// Authenticate against the environment-provided credentials if running
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
app.use(cookieParser(cookieSecret));
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: false,
        maxAge: 631138519494
    }
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// send assetPath to all views
app.use(function (req, res, next) {
  res.locals.assetPath="/public/";
  next();
});


//Global Middleware
app.use(form);

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
    var errors = req.form.getErrors();
    var formData = req.form.getData();

    res.render(path, {errors: errors, formData: formData}, function (err, html) {
        if (err) {
            console.log(err);
            res.sendStatus(404);
        } else {
            res.end(html);
        }
    });

});

// start the app

app.listen(port);
console.log('');
console.log('Listening on port ' + port);
console.log('');
