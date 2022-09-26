// Core dependencies
const path = require('path')

// Local dependencies
const { buildWatchAndServe } = require('./lib/build/tasks')
const { packageDir } = require('./lib/path-utils')
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

console.log(`GOV.UK Prototype Kit ${kitVersion}`)
console.log('')
console.log('starting...')

;(async () => {
  await collectDataUsage()
  await buildWatchAndServe()
})()
