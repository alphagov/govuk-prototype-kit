var gruntfile = __dirname + '/Gruntfile.js';
require(__dirname + '/node_modules/grunt/lib/grunt.js').cli({
  'gruntfile' : gruntfile
});

process.on('SIGINT', function() {
  process.kill(process.pid, 'SIGTERM');
  process.exit();
});
