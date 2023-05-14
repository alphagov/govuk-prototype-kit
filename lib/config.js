/*
 * Convenience module to make importing users app/config.js file easier,
 * handling the case where that files does not exist.
 */

// core dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')
const { isString } = require('lodash')

// local dependencies
const { appDir } = require('./utils/paths')

const appConfigPath = path.join(appDir, 'config.json')

function getConfigFromFile (swallowError = true) {
  const configFileExists = fse.existsSync(appConfigPath)
  if (configFileExists) {
    try {
      return fse.readJsonSync(appConfigPath)
    } catch (e) {
      if (swallowError) {
        console.error(`Could not load config from ${appConfigPath}, please check your JSON is well formed.`)
      } else {
        throw e
      }
    }
  }
  return {}
}

const asNumber = inputString => isString(inputString) ? Number(inputString) : inputString
const asBoolean = inputString => isString(inputString) ? inputString.toLowerCase() === 'true' : inputString
const asString = inputString => inputString
const asJson = inputString => isString(inputString) ? JSON.parse(inputString) : inputString

// Are we running on Glitch.com?
function onGlitch () {
  // there isn't an official way to check, but this was recommended
  // https://support.glitch.com/t/detect-if-app-is-running-on-glitch/3120
  return Boolean(process.env.PROJECT_REMIX_CHAIN)
}

// Get a normalised form of NODE_ENV

//
// Returns a lower-case string representing the environment the node.js app
// is running in. Normally this will be one of `production`, `development`,
// or `test`, although it can be any lower-case string. In most
// circumstances the value is derived from the environment variable
// NODE_ENV, defaulting to `development` if that is not set.
function getNodeEnv () {
  const glitchEnv = onGlitch() ? 'production' : false // Glitch doesn't set NODE_ENV, but we want to treat it as production
  const env = (process.env.NODE_ENV || glitchEnv || 'development').toLowerCase()
  return env
}

function getConfig (config, swallowError = true) {
  config = config || { ...getConfigFromFile(swallowError) }

  const overrideOrDefault = (configName, envName, processor, defaultValue) => {
    const environmentValue = process.env[envName]
    if (environmentValue !== undefined) {
      config[configName] = processor(environmentValue)
    } else if (config[configName] !== undefined) {
      config[configName] = processor(config[configName])
    } else if (defaultValue !== undefined && config[configName] === undefined) {
      config[configName] = defaultValue
    }
  }

  config.onGlitch = onGlitch()
  config.isProduction = getNodeEnv() === 'production'
  config.isDevelopment = getNodeEnv() === 'development'
  config.isTest = getNodeEnv() === 'test' || process.env.IS_INTEGRATION_TEST === 'true'

  // Support baseExtensions for backwards compatibility
  // TODO: remove in v14?
  if (config.baseExtensions) {
    config.basePlugins = config.baseExtensions
    delete config.baseExtensions
  }

  overrideOrDefault('basePlugins', 'BASE_PLUGINS', asJson, ['govuk-prototype-kit', 'govuk-frontend'])
  overrideOrDefault('useAuth', 'USE_AUTH', asBoolean, true)
  overrideOrDefault('useHttps', 'USE_HTTPS', asBoolean, true)
  overrideOrDefault('port', 'PORT', asNumber, 3000)
  overrideOrDefault('useBrowserSync', 'USE_BROWSER_SYNC', asBoolean, true)
  overrideOrDefault('useAutoStoreData', 'USE_AUTO_STORE_DATA', asBoolean, true)
  overrideOrDefault('useNjkExtensions', 'USE_NJK_EXTENSIONS', asBoolean, false)
  overrideOrDefault('logPerformance', 'LOG_PERFORMANCE', asBoolean, false)
  overrideOrDefault('logPerformanceMatching', 'LOG_PERFORMANCE_MATCHING', asString, undefined)
  overrideOrDefault('logPerformanceSummary', 'LOG_PERFORMANCE_SUMMARY', asNumber, undefined)
  overrideOrDefault('verbose', 'VERBOSE', asBoolean, false)
  overrideOrDefault('showPrereleases', 'SHOW_PRERELEASES', asBoolean, false)
  overrideOrDefault('allowGovukFrontendUninstall', 'ALLOW_GOVUK_FRONTEND_UNINSTALL', asBoolean, false)
  overrideOrDefault('editInBrowser', 'EDIT_IN_BROWSER', asBoolean, false)

  if (config.serviceName === undefined) {
    config.serviceName = 'GOV.UK Prototype Kit'
  }

  if (process.env.PASSWORD) {
    config.password = process.env.PASSWORD
  }

  return config
}

module.exports = {
  getConfig
}
