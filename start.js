// Core dependencies
const path = require('path')
const fs = require('fs')

// Warn if node_modules folder doesn't exist
// HACK: Check /express since we are committing in node_modules in this prototype version of the kit
const nodeModulesExists = fs.existsSync(path.join(__dirname, '/node_modules', '/express'))
if (!nodeModulesExists) {
  console.error('ERROR: Node module folder missing. Try running `npm install`')
  process.exit(0)
}

// Create template .env file if it doesn't exist
const envExists = fs.existsSync(path.join(__dirname, '/.env'))
if (!envExists) {
  console.log('Creating template .env file')
  fs.createReadStream(path.join(__dirname, '/lib/template.env'))
  .pipe(fs.createWriteStream(path.join(__dirname, '/.env')))
}

// Run gulp
const spawn = require('cross-spawn')

process.env['FORCE_COLOR'] = 1
var gulp = spawn('gulp')
gulp.stdout.pipe(process.stdout)
gulp.stderr.pipe(process.stderr)
process.stdin.pipe(gulp.stdin)

gulp.on('exit', function (code) {
  console.log('gulp exited with code ' + code.toString())
})
