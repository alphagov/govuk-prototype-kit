// Check for `node_modules` folder and warn if missing

var path = require('path')
var fs = require('fs')

if (!fs.existsSync(path.join(__dirname, '/node_modules'))) {
  console.error('ERROR: Node module folder missing. Try running `npm install`')
  process.exit(0)
}

// run gulp

var spawn = require('cross-spawn')

process.env['FORCE_COLOR'] = 1
var gulp = spawn('gulp')
gulp.stdout.pipe(process.stdout)
gulp.stderr.pipe(process.stderr)
process.stdin.pipe(gulp.stdin)

gulp.on('exit', function (code) {
  console.log('gulp exited with code ' + code.toString())
})
