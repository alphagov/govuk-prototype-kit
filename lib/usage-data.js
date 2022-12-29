
// core dependencies
const fs = require('fs')
const os = require('os')
const path = require('path')

// npm dependencies
const inquirer = require('inquirer')
const universalAnalytics = require('universal-analytics')
const { v4: uuidv4 } = require('uuid')

// local dependencies
const packageJson = require('../package.json')
const { projectDir } = require('./utils/paths')

const usageDataFilePath = path.join(projectDir, 'usage-data-config.json')

const USAGE_DATA_PROMPT = `
Help us improve the GOV.UK Prototype Kit
────────────────────────────────────────

With your permission, the kit can send useful anonymous usage data
for analysis to help the team improve the service. Read more here:
https://prototype-kit.service.gov.uk/docs/usage-data

Do you give permission for the kit to send anonymous usage data?
`.trim()

function getUsageDataConfig () {
  // Try to read config file to see if usage data is opted in
  let usageDataConfig = {}
  try {
    usageDataConfig = require(usageDataFilePath)
  } catch (e) {
    // do nothing - we will make a config
  }
  return usageDataConfig
}

function setUsageDataConfig (usageDataConfig) {
  const usageDataConfigJSON = JSON.stringify(usageDataConfig, null, '  ')
  try {
    fs.writeFileSync(usageDataFilePath, usageDataConfigJSON)
    return true
  } catch (error) {
    console.error(error)
  }
  return false
}

// Ask for permission to track data
// returns a Promise with the user's answer
function askForUsageDataPermission () {
  return inquirer.prompt([{
    name: 'usageData',
    message: USAGE_DATA_PROMPT,
    type: 'confirm',
    when: () => process.stdout.isTTY,
    default: false
  }]).then(answers => answers.usageData)
}

function startTracking (usageDataConfig) {
  // Get client ID for tracking
  // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#cid

  if (usageDataConfig.clientId === undefined) {
    usageDataConfig.clientId = uuidv4()
    module.exports.setUsageDataConfig(usageDataConfig)
  }

  // Track kit start event, with kit version, operating system and Node.js version
  const trackingId = 'UA-26179049-21'
  const trackingUser = universalAnalytics(trackingId, usageDataConfig.clientId)

  const kitVersion = packageJson.version
  const operatingSystem = os.platform() + ' ' + os.release()
  const nodeVersion = process.versions.node

  // Anonymise the IP
  trackingUser.set('anonymizeIp', 1)

  // Set custom dimensions
  trackingUser.set('cd1', operatingSystem)
  trackingUser.set('cd2', kitVersion)
  trackingUser.set('cd3', nodeVersion)

  // Trigger start event
  trackingUser.event('State', 'Start').send()
}

async function collectDataUsage () {
  // Get usageDataConfig from file, if exists
  const usageDataConfig = module.exports.getUsageDataConfig()

  if (usageDataConfig.collectUsageData === undefined) {
    // No recorded answer, so ask for permission
    const permissionGranted = await module.exports.askForUsageDataPermission()
    usageDataConfig.collectUsageData = permissionGranted
    module.exports.setUsageDataConfig(usageDataConfig)

    if (permissionGranted) {
      module.exports.startTracking(usageDataConfig)
    }
  } else {
    if (usageDataConfig.collectUsageData === true) {
      // Opted in
      module.exports.startTracking(usageDataConfig)
    }
  }
}

module.exports = {
  getUsageDataConfig,
  setUsageDataConfig,
  askForUsageDataPermission,
  startTracking,
  collectDataUsage
}
