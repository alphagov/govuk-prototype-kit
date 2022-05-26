// Core dependencies
const path = require('path')
const fs = require('fs')

// Local dependencies
const { buildWatchAndServe } = require('./lib/build/tasks')

async function collectDataUsage () {
// Local dependencies
  const usageData = require('./lib/usage_data')

  // Get usageDataConfig from file, if exists
  const usageDataConfig = usageData.getUsageDataConfig()

  if (usageDataConfig.collectUsageData === undefined) {
    // No recorded answer, so ask for permission
    const permissionGranted = await usageData.askForUsageDataPermission()
    usageDataConfig.collectUsageData = permissionGranted
    usageData.setUsageDataConfig(usageDataConfig)

    if (permissionGranted) {
      usageData.startTracking(usageDataConfig)
    }
  } else {
    if (usageDataConfig.collectUsageData === true) {
      // Opted in
      usageData.startTracking(usageDataConfig)
    }
  }
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

function createSessionDataDefaults () {
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
}

(async () => {
  checkFiles()
  createSessionDataDefaults()
  await collectDataUsage()
  buildWatchAndServe()
})()
