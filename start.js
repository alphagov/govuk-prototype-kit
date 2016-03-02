// Check for `node_modules` folder and warn if missing
var fs = require('fs');

if (!fs.existsSync(__dirname + '/node_modules')) {
  console.error('ERROR: Node module folder missing. Try running `npm install`');
  process.exit(0);
}

// remove .port.tmp if it exists  
try {
  fs.unlinkSync(__dirname + '/.port.tmp');
} catch(e){}

var gruntfile = __dirname + '/Gruntfile.js';

require(__dirname + '/node_modules/grunt/lib/grunt.js').cli({
  'gruntfile' : gruntfile
});

process.on('SIGINT', function() {

  // remove .port.tmp if it exists  
  try {
    fs.unlinkSync(__dirname + '/.port.tmp');
  } catch(e){}

  process.exit(0);

});
