var express = require('express'),
    mu = require('mu2'),
    mu2Express = require('mu2Express'),
    app = express(),
    routes,
    applyLayout,
    renderPage,
    applyRoutes,
    replace = require("replace");

console.log("looking for filter:chroma in sass files...");

replace({
  regex: "filter:chroma(.*);",
  replacement: 'filter:unquote("chroma$1");',
  paths: [__dirname + '/node_modules/govuk_frontend_toolkit/govuk_frontend_toolkit/stylesheets'],
  recursive: true,
  silent: false,
});

// Function for wrapping partials in the govuk_template
applyLayout = function (pageString, title, res) {
  res.render('layouts/govuk_template', {
    'locals' : {
      'pageTitle': title,
      'assetPath': '/public/',
      'head': '<link href="/public/stylesheets/application.css" rel="stylesheet" type="text/css" />',
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
app.set('views', __dirname + '/govuk/views');

// Middleware to serve static assets
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/govuk/public'));

// Mustache settings
mu.root = __dirname + '/views';

// Routes - make sure to put the most specific at the top (the last one should always be '/'

app.get('/', function (req, res) {
  renderPage('index.html', 'Index page', res);
});


app.get('/sample', function (req, res) {
  renderPage('sample-page.html', 'Sample page', res);
});

app.listen(3000);
console.log('');
console.log('Listening on port 3000');
console.log('');
