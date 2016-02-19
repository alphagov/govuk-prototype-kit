var basicAuth = require('basic-auth'),
    prompt = require('prompt'),
    portScanner = require('portscanner'),
    request = require('sync-request');

/**
 * Simple basic auth middleware for use with Express 4.x.
 *
 * Based on template found at: http://www.danielstjules.com/2014/08/03/basic-auth-with-express-4/
 *
 * @example
 * app.use('/api-requiring-auth', utils.basicAuth('username', 'password'));
 *
 * @param   {string}   username Expected username
 * @param   {string}   password Expected password
 * @returns {function} Express 4 middleware requiring the given credentials
 */
exports.basicAuth = function(username, password) {
	return function(req, res, next) {

		if (!username || !password) {
			console.log('Username or password is not set.');
			return res.send('<h1>Error:</h1><p>Username or password not set. <a href="https://github.com/alphagov/govuk_prototype_kit/blob/master/docs/deploying.md#3-set-a-username-and-password">See guidance for setting these</a>.</p>');
		}
		
		var user = basicAuth(req);

		if (!user || user.name !== username || user.pass !== password) {
			res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
			return res.sendStatus(401);
		}

		next();
	};
};

// Matches routes
exports.matchRoutes = function(req, res) {

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

};

// Synchronously get the url for the latest release on github
exports.getLatestRelease = function() {
  var url = "";
  var options = {
    headers: {'user-agent': 'node.js'}
  }; 
  var gitHubUrl = 'https://api.github.com/repos/alphagov/govuk_prototype_kit/releases/latest';
  try {
      res = request('GET', gitHubUrl, options);
      var data = JSON.parse(res.getBody('utf8'));
      url = data.zipball_url;
  }
  catch(err) {
      url = "https://github.com/alphagov/govuk_prototype_kit/releases/latest";
  }
  console.log("Release url is", url);
  return url;
};


exports.findAvailablePort = function(app){

  var port = (process.env.PORT || 3000);

  console.log('');
  // Check that default port is free, else offer to change
  portScanner.findAPortNotInUse(port, port+50, '127.0.0.1', function(error, availablePort) {

    if (port == availablePort){
      app.listen(port);
      console.log('Listening on port ' + port + '   url: http://localhost:' + port);
    }
    else {
      // Default port in use - offer to change to available port
      console.error("ERROR: Port " + port + " in use - you may have another prototype running.\n");
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
          console.log('\nYou can set a new default port in server.js, or by running the server with PORT=XXXX');
          console.log("\nExit by pressing 'ctrl + c'");
          process.exit(0);
        }
      });
    }
  });

};
