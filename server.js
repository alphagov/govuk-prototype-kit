var path = require('path'),
    express = require('express'),
    presenters = require(__dirname + '/app/presenters.js'),
    defaults = require(__dirname + '/app/defaults.js'),
    routes = require(__dirname + '/app/routes.js'),
    merge = require('merge'),
    user_data = require(__dirname + '/lib/user_data.js'),
    app = express(),
    port = (process.env.PORT || 3000),

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
  app.use(express.basicAuth(username, password));
}

// Application settings
app.engine('html', require(__dirname + '/lib/template-engine.js').__express);
app.set('view engine', 'html');
app.set('vendorViews', __dirname + '/govuk_modules/govuk_template/views/layouts');
app.set('views', __dirname + '/app/views');

// Middleware to serve static assets
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_template/assets'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit'));

app.use(express.favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images','favicon.ico')));


// send assetPath to all views
app.use(function (req, res, next) {
  res.locals({'assetPath': '/public/'});
  next();
});


// Set up the form cookie.
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(user_data.form_to_cookie(presenters));

// routes (found in app/routes.js)

routes.bind(app);

// auto render any view that exists

app.get(/^\/([^.]+)$/, function (req, res) {

	var path = (req.params[0]);

	res.render(path, merge(true, defaults, req.cookies), function(err, html) {
		if (err) {
			console.log(err);
			res.send(404);
		} else {
			res.end(html);
		}
	});

});

app.post(/^\/([^.]+)$/, function (req, res) {
	var path = (req.params[0]);
  res.redirect(path);
});

// start the app

app.listen(port);
console.log('');
console.log('Listening on port ' + port);
console.log('');
