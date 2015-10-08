var fs = require('fs'),
    argv = require('minimist')(process.argv.slice(2)),
    fileOptions = { encoding : 'utf-8' },
    gruntfile;

// start grunt
gruntfile = __dirname + '/Gruntfile.js';
require(__dirname + '/node_modules/grunt/lib/grunt.js').cli({
  'gruntfile' : gruntfile
});

process.on('SIGINT', function() {
  process.kill(process.pid, 'SIGTERM');
  process.exit();
});
