// Core dependencies
const path = require('path')
const fs = require('fs')
const os = require('os')

// NPM dependencies
const prompt = require('prompt')
const universalAnalytics = require('universal-analytics')
const uuidv4 = require('uuid/v4')

// Local dependencies
const packageJson = require('../package.json')

exports.getUsageDataConfig = function () {
  // Try to read config file to see if usage data is opted in
  let usageDataConfig = {}
  try {
    usageDataConfig = require(path.join(__dirname, '../usage-data-config.json'))
  } catch (e) {
    // do nothing - we will make a config
  }
  return usageDataConfig
}

exports.setUsageDataConfig = function (usageDataConfig) {
  const usageDataConfigJSON = JSON.stringify(usageDataConfig, null, '  ')
  try {
    fs.writeFileSync(path.join(__dirname, '../usage-data-config.json'), usageDataConfigJSON)
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
    // Set up prompt settings
    prompt.colors = false
    prompt.start()
    prompt.message = ''
    prompt.delimiter = ''

    const description = fs.readFileSync(path.join(__dirname, 'usage-data-prompt.txt'), 'utf8')

    prompt.get([{
      name: 'answer',
      description: description,
      required: true,
      type: 'string',
      pattern: /y(es)?|no?/i,
      message: 'Please enter y or n',
      ask: function () {
        return process.stdout.isTTY
      }
    }], function (err, result) {
      if (err) {
        reject(err)
      }
      if (result.answer.match(/y(es)?/i)) {
        resolve('yes')
      } else {
        resolve('no')
      }
    })
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
