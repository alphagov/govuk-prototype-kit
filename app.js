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

var assetPath = '/public/';

routes.bind(app, assetPath);

// auto render any view that exists

app.get(/^\/(.+)/, function (req, res) {

	var path = (req.params[0]);

	res.render(path, {'assetPath' : assetPath }, function(err, html) {
		if (err) {
			console.log(err);
			res.send(404);
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