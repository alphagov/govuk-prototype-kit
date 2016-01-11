// Check for `node_modules` folder and warn if missing
var fs = require('fs');
if (!fs.existsSync(__dirname + '/node_modules')) {
  console.error('ERROR: Node module folder missing. Try running `npm install`');
  process.exit(0);
}

var gruntfile = __dirname + '/Gruntfile.js';
require(__dirname + '/node_modules/grunt/lib/grunt.js').cli({
  'gruntfile' : gruntfile
});

process.on('SIGINT', function() {
  process.kill(process.pid, 'SIGTERM');
  process.exit();
});
