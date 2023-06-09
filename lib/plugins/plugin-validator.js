const fse = require('fs-extra')
const path = require('path')

const errors = []

function getKnownKeys () {
  const knownKeys = [
    'assets',
    'importNunjucksMacrosInto',
    'nunjucksPaths',
    'nunjucksMacros',
    'nunjucksFilters',
    'sass',
    'scripts',
    'stylesheets',
    'templates'
  ]
  return knownKeys
}

function checkPathExists (executionPath, pathToValidate, key) {
  const absolutePathToValidate = path.join(executionPath, pathToValidate)
  if (!fse.existsSync(absolutePathToValidate)) errors.push(`In section ${key}, the path '${pathToValidate}' does not exist`)
}

function validateConfigKeys (pluginConfig) {
  console.log('Config file exists, validating contents.')
  const knownKeys = getKnownKeys()
  const invalidKeys = []

  const validKeysPluginConfig = Object.fromEntries(Object.entries(pluginConfig).filter(([key, value]) => {
    if (knownKeys.includes(key)) {
      return true
    }
    invalidKeys.push(key)
    return false
  }))

  // Add any invalid config keys to the list of errors
  if (invalidKeys.length > 0) {
    errors.push(`The following invalid keys exist in your config: ${invalidKeys}`)
  }

  return validKeysPluginConfig
}

function validateConfigPaths (pluginConfig, executionPath) {
  console.log('Validating whether config paths meet criteria.')
  const keysToValidate = Object.keys(pluginConfig)

  keysToValidate.forEach(key => {
    // Convert any strings to an array so that they can be processed
    let criteriaConfig = pluginConfig[key]
    if (!Array.isArray(criteriaConfig)) {
      criteriaConfig = [criteriaConfig]
    }

    criteriaConfig.forEach((configEntry, index) => {
      try {
        if (typeof configEntry === 'string' && configEntry[0] === '/') {
          checkPathExists(executionPath, configEntry, key)
        } else if ((key === 'templates' && configEntry.path[0] === '/') ||
                  (key === 'scripts' && configEntry.path !== undefined && configEntry.path[0] === '/')) {
          checkPathExists(executionPath, configEntry.path, key)
        } else if ((key === 'nunjucksMacros')) {
          checkPathExists(executionPath, configEntry.importFrom, key)
        } else {
          // Find the path for the ones that can be objects
          const invalidPath = (key === 'templates' || (key === 'scripts' && configEntry.path !== undefined))
            ? configEntry.path
            : configEntry
          errors.push(`In section ${key}, the path '${invalidPath}' does not start with a '/'`)
        }
      } catch (e) {
        console.log(e)
      }
    })
  })
}

async function validatePlugin (executionPath) {
  const configPath = path.join(executionPath, 'govuk-prototype-kit.config.json')
  await fse.exists(configPath).then(exists => {
    if (exists) {
      let pluginConfig
      try {
        pluginConfig = JSON.parse(fse.readFileSync(configPath).toString())
      } catch (error) {
        // Catch any syntax errors in the config
        errors.push('Your govuk-prototype-kit.config.json file is not valid json.')
      }

      // Check if the json has contents
      let isConfigEmpty = false
      if (JSON.stringify(pluginConfig) === '{}') {
        isConfigEmpty = true
      }

      // Continue with the validation if there are no syntax errors in the config
      if (pluginConfig) {
        if (isConfigEmpty) {
          errors.push('There are no contents in your govuk-prototype.config file!')
        } else {
          // Perform the rest of the checks if the config file has contents
          const validKeysPluginConfig = validateConfigKeys(pluginConfig)
          validateConfigPaths(validKeysPluginConfig, executionPath)
        }
      }
    } else {
      errors.push('The plugin does not have a govuk-prototype-kit.config.json file, all plugins must have this file to be valid.')
    }
  })
  if (!errors.length > 0) {
    console.log('The plugin config is valid.')
  } else {
    process.exitCode = 100
    errors.forEach(err => console.error('Error:', err))
  }
}

module.exports = {
  validatePlugin
}
