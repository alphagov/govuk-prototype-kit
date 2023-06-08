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
  // TODO: Need to confirm known plugin keys as we initially thought nunjucksMacros did not exist in the known keys list
  return knownKeys
}

function checkPathExists (executionPath, pathToValidate, key) {
  const absolutePathToValidate = path.join(executionPath, pathToValidate)
  if (!fse.existsSync(absolutePathToValidate)) errors.push(`In section ${key}, the path '${pathToValidate}' does not exist`)
}

function validateConfigKeys (pluginConfig) {
  console.log('Config file exists, validating contents.')
  const knownKeys = getKnownKeys()
  const keysToValidate = Object.keys(pluginConfig)
  const invalidKeys = keysToValidate.filter(keyToValidate => {
    if (!knownKeys.includes(keyToValidate)) {
      return keyToValidate
    }
    return null
  })

  // Add any invalid config keys to the list of errors
  if (invalidKeys.length > 0) {
    errors.push(`The following invalid keys exist in your config: ${invalidKeys}`)
  }
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

    criteriaConfig.forEach((pathToValidate, index) => {
      try {
        if (pathToValidate[0] === '/') {
          checkPathExists(executionPath, pathToValidate, key)
        } else if ((key === 'templates' && pathToValidate.path[0] === '/') ||
                  (key === 'scripts' && pathToValidate.path !== undefined && pathToValidate.path[0] === '/')) {
          checkPathExists(executionPath, pathToValidate.path, key)
        } else if ((key === 'nunjucksMacros')) { // TODO: Should we be also checking for && !pathToValidate.importFrom[0] === '/' ?
          checkPathExists(executionPath, pathToValidate.importFrom, key)
        } else {
          // Find the path for the ones that can be objects
          const invalidPath = (key === 'templates' || (key === 'scripts' && pathToValidate.path !== undefined))
            ? pathToValidate.path
            : pathToValidate
          errors.push(`In section ${key}, the path '${invalidPath}' does not start with a '/'`)
        }
      } catch (e) {
        console.log(e)
      }
    })
  })
}

async function validatePlugin () {
  const executionPath = process.cwd()
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
          validateConfigKeys(pluginConfig)
          validateConfigPaths(pluginConfig, executionPath)
        }
      }
    } else {
      errors.push('The plugin does not have a govuk-prototype-kit.config.json file, all plugins must have this file to be valid.')
    }
  })
  if (!errors.length > 0) {
    errors.push('The plugin config is valid.')
  }
  console.log(errors.toString())
}

module.exports = {
  validatePlugin
}
