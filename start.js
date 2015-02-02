var fs = require('fs'),
    argv = require('minimist')(process.argv.slice(2)),
    pidFile = __dirname + '/.start.pid',
    fileOptions = { encoding : 'utf-8' },
    gruntfile;

// start grunt
gruntfile = __dirname + '/Gruntfile.js';
require(__dirname + '/node_modules/grunt/lib/grunt.js').cli({
  'gruntfile' : gruntfile
});

fs.writeFileSync(pidFile, process.pid, fileOptions);

process.on('SIGINT', function() {
  var pid = fs.readFileSync(pidFile, fileOptions);

  fs.unlink(pidFile);
  process.kill(pid, 'SIGTERM');
  process.exit();
});
