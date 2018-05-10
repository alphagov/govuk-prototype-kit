// Core dependencies
const path = require('path')
const fs = require('fs')

// Warn if node_modules folder doesn't exist
const nodeModulesExists = fs.existsSync(path.join(__dirname, '/node_modules'))
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


const dataDirectory = path.join(__dirname, '/app/data')

// Create template session data defaults file if it doesn't exist
const sessionDataDefaultsFile = path.join(dataDirectory, '/session-data-defaults.js')
const sessionDataDefaultsFileExists = fs.existsSync(sessionDataDefaultsFile)

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory)
}

if (!sessionDataDefaultsFileExists) {
  console.log('Creating session data defaults file')
  fs.createReadStream(path.join(__dirname, '/lib/template.session-data-defaults.js'))
  .pipe(fs.createWriteStream(sessionDataDefaultsFile))
}

// Create global data file if it doesn't exist
const globalDataFile = path.join(dataDirectory, '/global-data.js')
const globalDataFileExists = fs.existsSync(globalDataFile)

if (!globalDataFileExists) {
  console.log('Creating global data file')
  fs.createReadStream(path.join(__dirname, '/lib/template.global-data.js'))
  .pipe(fs.createWriteStream(globalDataFile))
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
