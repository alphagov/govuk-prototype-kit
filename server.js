var express = require('express'),
    mu = require('mu2'),
    mu2Express = require('mu2Express'),
    app = express(),
    routes,
    applyLayout,
    renderPage,
    applyRoutes;

// Function for wrapping partials in the govuk_template
applyLayout = function (pageString, title, res) {
  res.render('layouts/govuk_template', {
    'locals' : {
      'pageTitle': title,
      'assetPath': '/assets/',
      'head': '<link href="/assets/stylesheets/application.css" rel="stylesheet" type="text/css" />',
      'content': pageString
    }
  });
};

// Function for rendering a page
renderPage = function (page, title, res) {
  mu.compileAndRender(page, {})
    .on('data', function (data) {
      applyLayout(data.toString(), title, res);    
    });
};

// Application settings
app.engine('html', mu2Express.engine);
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');

// Middleware to serve static assets
app.use('/assets/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/assets/stylesheets', express.static(__dirname + '/app/assets/stylesheets'));
app.use('/assets/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/assets/javascripts', express.static(__dirname + '/app/assets/javascripts'));
app.use('/assets/images', express.static(__dirname + '/public/images'));
app.use('/assets/images', express.static(__dirname + '/app/assets/images'));

// Mustache settings
mu.root = __dirname + '/app/views';

// Routes - make sure to put the most specific at the top (the last one should always be '/'
app.get('/sample', function (req, res) {
  renderPage('sample-page.html', 'Sample page', res);
});

app.get('/', function (req, res) {
  renderPage('index.html', 'Index page', res);
});

app.listen(3000);
console.log('');
console.log('Listening on port 3000');
console.log('');
