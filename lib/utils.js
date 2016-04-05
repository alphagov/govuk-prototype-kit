var basicAuth = require('basic-auth'),
    config = require(__dirname + '/../app/config.js'),
    fs = require('fs');
    portScanner = require('portscanner'),
    prompt = require('prompt');

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
			return res.send('<h1>Error:</h1><p>Username or password not set. <a href="https://github.com/alphagov/govuk_prototype_kit/blob/master/docs/guides/publishing-on-heroku.md#5-set-a-username-and-password">See guidance for setting these</a>.</p>');
		}
		
		var user = basicAuth(req);

		if (!user || user.name !== username || user.pass !== password) {
			res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
			return res.sendStatus(401);
		}

		next();
	};
};

exports.findAvailablePort = function(app){

  var port = null;

  try {
    port = Number(fs.readFileSync(__dirname+'/../.port.tmp'));
  } catch (e){
    port = Number(process.env.PORT || config.port);
  }

  console.log('');

  // Check that default port is free, else offer to change
  portScanner.findAPortNotInUse(port, port+50, '127.0.0.1', function(error, availablePort) {

    if (port == availablePort){

      app.listen(port);
      console.log('Listening on port ' + port + '   url: http://localhost:' + port);

    } else {

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
          fs.writeFileSync(__dirname+'/../.port.tmp', port);
          app.listen(port);
          console.log('Changed to port ' + port + '   url: http://localhost:' + port);

        } else {

          // User answers no - exit
          console.log('\nYou can set a new default port in server.js, or by running the server with PORT=XXXX');
          console.log("\nExit by pressing 'ctrl + c'");
          process.exit(0);

        }
      });
    }
  });

}
