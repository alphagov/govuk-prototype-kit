/*
 * Convenience module to make importing users app/config.js file easier,
 * handling the case where that files does not exist.
 */

const fse = require('fs-extra')
const path = require('path')

const { appDir } = require('./path-utils')
const appConfigPath = path.join(appDir, 'config.json')

function getConfigFromFile () {
  const configFileExists = fse.existsSync(appConfigPath)
  if (configFileExists) {
    return fse.readJsonSync(appConfigPath)
  }
  return {}
}

const asNumber = inputString => Number(inputString)
const asBoolean = inputString => inputString.toLowerCase() === 'true'
const asJson = inputString => JSON.parse(inputString)

const getConfig = () => {

  const overrideOrDefault = (configName, envName, processor, defaultValue) => {
    const environmentValue = process.env[envName]
    if (environmentValue !== undefined) {
      config[configName] = processor(environmentValue)
    } else if (defaultValue !== undefined && config[configName] === undefined) {
      config[configName] = defaultValue
    }
  }

  const config = {}

  const configFromFile = getConfigFromFile()

  Object.assign(config, configFromFile)

  overrideOrDefault('baseExtensions', 'BASE_EXTENSIONS', asJson, ['govuk-prototype-kit', 'govuk-frontend'])
  overrideOrDefault('useAuth', 'USE_AUTH', asBoolean, false)
  overrideOrDefault('port', 'PORT', asNumber, 3000)
  overrideOrDefault('useBrowserSync', 'USE_BROWSER_SYNC', asBoolean, true)
  overrideOrDefault('useAutoStoreData', 'USE_AUTO_STORE_DATA', asBoolean, true)

  if (config.serviceName === undefined) {
    config.serviceName = 'GOV.UK Prototype Kit'
  }

  return config
}

module.exports = {
  getConfig: getConfig,
}
