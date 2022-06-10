// Core dependencies
const path = require('path')
const fs = require('fs')
const os = require('os')

// NPM dependencies
const inquirer = require('inquirer')
const universalAnalytics = require('universal-analytics')
const { v4: uuidv4 } = require('uuid')

// Local dependencies
const packageJson = require('../package.json')
const { projectDir } = require('./utils')
const usageDataFilePath = path.join(projectDir, 'usage-data-config.json')

exports.getUsageDataConfig = function () {
  // Try to read config file to see if usage data is opted in
  let usageDataConfig = {}
  try {
    usageDataConfig = require(usageDataFilePath)
  } catch (e) {
    // do nothing - we will make a config
  }
  return usageDataConfig
}

exports.setUsageDataConfig = function (usageDataConfig) {
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
exports.askForUsageDataPermission = function () {
  return new Promise(function (resolve, reject) {
    const description = fs.readFileSync(path.join(__dirname, 'usage-data-prompt.txt'), 'utf8').trim()

    inquirer.prompt([{
      name: 'usageData',
      message: description,
      type: 'confirm',
      when: () => process.stdout.isTTY,
      default: false
    }]).then(answers => resolve(answers.usageData))
  })
}

exports.startTracking = function (usageDataConfig) {
  // Get client ID for tracking
  // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#cid

  if (usageDataConfig.clientId === undefined) {
    usageDataConfig.clientId = uuidv4()
    exports.setUsageDataConfig(usageDataConfig)
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
