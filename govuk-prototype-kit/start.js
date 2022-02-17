// Core dependencies
const path = require('path')
const fs = require('fs')

const userProject = process.cwd()
const prototypeKitModule = __dirname

checkFiles()

// Local dependencies
const usageData = require('./lib/usage_data')

// Get usageDataConfig from file, if exists
const usageDataConfig = usageData.getUsageDataConfig()

if (usageDataConfig.collectUsageData === undefined) {
  // No recorded answer, so ask for permission
  const promptPromise = usageData.askForUsageDataPermission()
  promptPromise.then(function (permissionGranted) {
    usageDataConfig.collectUsageData = permissionGranted
    usageData.setUsageDataConfig(usageDataConfig)

    if (permissionGranted) {
      usageData.startTracking(usageDataConfig)
    }

    runGulp()
  })
} else if (usageDataConfig.collectUsageData === true) {
  // Opted in
  usageData.startTracking(usageDataConfig)
  runGulp()
} else {
  // Opted out
  runGulp()
}

// Warn if node_modules folder doesn't exist
function checkFiles () {
  const nodeModulesExists = fs.existsSync(path.join(userProject, '/node_modules'))
  if (!nodeModulesExists) {
    console.error('ERROR: Node module folder missing. Try running `npm install`')
    process.exit(0)
  }

  // Create template .env file if it doesn't exist
  const envExists = fs.existsSync(path.join(prototypeKitModule, '/.env'))
  if (!envExists) {
    fs.createReadStream(path.join(prototypeKitModule, '/lib/template.env'))
      .pipe(fs.createWriteStream(path.join(prototypeKitModule, '/.env')))
  }
}

// Create template session data defaults file if it doesn't exist
const dataDirectory = path.join(prototypeKitModule, '/app/data')
const sessionDataDefaultsFile = path.join(dataDirectory, '/session-data-defaults.js')
const sessionDataDefaultsFileExists = fs.existsSync(sessionDataDefaultsFile)

if (!sessionDataDefaultsFileExists) {
  console.log('Creating session data defaults file')
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory)
  }

  fs.createReadStream(path.join(prototypeKitModule, '/lib/template.session-data-defaults.js'))
    .pipe(fs.createWriteStream(sessionDataDefaultsFile))
}

// Run gulp
function runGulp () {
  console.log('running gulp')
  const spawn = require('cross-spawn')

  process.env.FORCE_COLOR = 1
  var gulp = spawn('node', ['./node_modules/gulp/bin/gulp.js', '--log-level', '-L', '-f', 'node_modules/govuk-prototype-kit/gulpfile.js'])
  gulp.stdout.pipe(process.stdout)
  gulp.stderr.pipe(process.stderr)
  process.stdin.pipe(gulp.stdin)

  gulp.on('exit', function (code) {
    console.log('gulp exited with code ' + code.toString())
  })
}
