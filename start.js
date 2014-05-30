var fs = require('fs'),
    pidFile = __dirname + '/.start.pid',
    fileOptions = { encoding : 'utf-8' };

// start grunt

require(__dirname + '/node_modules/grunt/lib/grunt.js').cli();
fs.writeFileSync(pidFile, process.pid, fileOptions);
process.on('SIGINT', function() {
  var pid = fs.readFileSync(pidFile, fileOptions);

  fs.unlink(pidFile);
  process.kill(pid, 'SIGTERM');
  process.exit();
})
