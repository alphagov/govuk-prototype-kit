// Core dependencies
const path = require('path')
const fs = require('fs')
const log = require('fancy-log')
const nodemon = require('nodemon')
const colour = require('ansi-colors')
const config = require('./config.json')

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
  const nodeModulesExists = fs.existsSync(path.join(__dirname, '/node_modules'))
  if (!nodeModulesExists) {
    console.error('ERROR: Node module folder missing. Try running `npm install`')
    process.exit(0)
  }

  // Create template .env file if it doesn't exist
  const envExists = fs.existsSync(path.join(__dirname, '/.env'))
  if (!envExists) {
    fs.createReadStream(path.join(__dirname, '/lib/template.env'))
      .pipe(fs.createWriteStream(path.join(__dirname, '/.env')))
  }
}

// Create template session data defaults file if it doesn't exist
const dataDirectory = path.join(__dirname, '/app/data')
const sessionDataDefaultsFile = path.join(dataDirectory, '/session-data-defaults.js')
const sessionDataDefaultsFileExists = fs.existsSync(sessionDataDefaultsFile)

if (!sessionDataDefaultsFileExists) {
  console.log('Creating session data defaults file')
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory)
  }

  fs.createReadStream(path.join(__dirname, '/lib/template.session-data-defaults.js'))
    .pipe(fs.createWriteStream(sessionDataDefaultsFile))
}

// generate assets
// clean
// sass-extensions
// sass
// copy-assets
// sass-documentation
// copy-assets-documentation

// watch
// run server
function runGulp () {

  const nodemon = require('nodemon')

// Warn about npm install on crash
  const onCrash = () => {
    log(colour.cyan('[nodemon] For missing modules try running `npm install`'))
  }

// Remove .port.tmp if it exists
  const onQuit = () => {
    try {
      fs.unlinkSync(path.join(__dirname, '/../.port.tmp'))
    } catch (e) {}

    process.exit(0)
  }

  nodemon({
    watch: ['.env', '**/*.js', '**/*.json'],
    script: 'listen-on-port.js',
    ignore: [
      config.paths.public + '*',
      config.paths.assets + '*',
      config.paths.nodeModules + '*'
    ]
  })
    .on('crash', onCrash)
    .on('quit', onQuit)
}
