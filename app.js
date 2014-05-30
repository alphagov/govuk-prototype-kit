var express = require('express'),
    routes = require(__dirname + '/routes.js'),
    app = express(),
    port = (process.env.PORT || 3000);

// Application settings
app.engine('html', require(__dirname + '/lib/template-engine.js').__express);
app.set('view engine', 'html');
app.set('vendorViews', __dirname + '/govuk/views');
app.set('views', __dirname + '/views');

// Middleware to serve static assets
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/govuk/public'));

// routes (found in routes.js)

routes.bind(app, '/public/');

// start the app

app.listen(port);
console.log('');
console.log('Listening on port ' + port);
console.log('');
