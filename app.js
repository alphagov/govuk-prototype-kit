var express = require('express'),
    cons = require('consolidate'),
    app = express(),
    replace = require("replace"),
    mustacheRender = require("./lib/mustacheRender").mustacheRender;

console.log("looking for filter:chroma in sass files...");

replace({
  regex: "filter:chroma(.*);",
  replacement: 'filter:unquote("chroma$1");',
  paths: [__dirname + '/node_modules/govuk_frontend_toolkit/govuk_frontend_toolkit/stylesheets'],
  recursive: true,
  silent: false,
});

// Application settings
app.engine('html', cons.mustache);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Middleware to serve static assets
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/govuk/public'));

// middleware to wrap mustache views in govuk template

app.use(mustacheRender);

app.get('/', function (req, res) {
  res.render('index', {'pageTitle': 'index'});
});

app.get('/sample', function (req, res) {
  res.render('sample', {'pageTitle': 'sample'});
});

app.listen(3000);
console.log('');
console.log('Listening on port 3000');
console.log('');
