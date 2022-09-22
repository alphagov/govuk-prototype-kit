// Core dependencies
const path = require('path')
const fs = require('fs')

// Local dependencies
const { buildWatchAndServe } = require('./lib/build/tasks')
const { projectDir, packageDir } = require('./lib/path-utils')
const kitVersion = require(path.join(packageDir, 'package.json')).version

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

function createSessionDataDefaults () {
// Create template session data defaults file if it doesn't exist
  const dataDirectory = path.join(projectDir, '/app/data')
  const sessionDataDefaultsFile = path.join(dataDirectory, '/session-data-defaults.js')
  const sessionDataDefaultsFileExists = fs.existsSync(sessionDataDefaultsFile)

  if (!sessionDataDefaultsFileExists) {
    console.log('Creating session data defaults file')
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true })
    }

    fs.createReadStream(path.join(__dirname, '/lib/template.session-data-defaults.js'))
      .pipe(fs.createWriteStream(sessionDataDefaultsFile))
  }
}

console.log(`GOV.UK Prototype Kit ${kitVersion}`)
console.log('')
console.log('starting...')

;(async () => {
  createSessionDataDefaults()
  await collectDataUsage()
  await buildWatchAndServe()
})()
