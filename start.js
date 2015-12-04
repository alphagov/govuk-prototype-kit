// Check for `node_modules` folder and warn if missing
var fs = require('fs');
if (!fs.existsSync(__dirname + '/node_modules')) {
  console.error('ERROR: Node module folder missing. Try running `npm install`');
  process.exit(0);
}

// Only import utils if node_modules folder exists
utils = require(__dirname + '/lib/utils.js');
// Confirm that all modules in package.json exist
utils.checkNodeModules();

var gruntfile = __dirname + '/Gruntfile.js';
require(__dirname + '/node_modules/grunt/lib/grunt.js').cli({
  'gruntfile' : gruntfile
});

process.on('SIGINT', function() {
  process.kill(process.pid, 'SIGTERM');
  process.exit();
});

