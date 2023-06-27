const fse = require('fs-extra')
const path = require('path')
const ansiColors = require('ansi-colors')

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
    'templates',
    'pluginDependencies'
  ]
  return knownKeys
}

function checkPathExists (executionPath, pathToValidate, key) {
  const absolutePathToValidate = path.join(executionPath, pathToValidate)
  if (!fse.existsSync(absolutePathToValidate)) errors.push(`In section ${key}, the path '${pathToValidate}' does not exist`)
}

function checkNunjucksMacroExists (executionPath, nunjucksFileName, nunjucksPaths) {
  // set up a flag for the existance of a nunjucks path
  let nunjucksPathExists = false

  if (nunjucksPaths === undefined) {
    // Check if the nunjucksMacros are at the root level of the project
    if (fse.existsSync(path.join(executionPath, nunjucksFileName))) nunjucksPathExists = true
  } else {
    // Combine the file path name for each nunjucks path and check if any one of them exists
    for (const nunjucksPath of nunjucksPaths) {
      const pathToCheck = path.join(executionPath, nunjucksPath, nunjucksFileName)
      if (fse.existsSync(pathToCheck)) {
        nunjucksPathExists = true
        break
      }
    }
  }

  if (!nunjucksPathExists) errors.push(`The nunjucks file '${nunjucksFileName}' does not exist`)
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
        if (key === 'pluginDependencies') {
          if (typeof configEntry.packageName !== 'string') {
            errors.push(`In section ${key}, the packageName '${configEntry.packageName}' should be a valid package name`)
          }
          if (typeof configEntry.minVersion !== 'string') {
            errors.push(`In section ${key}, the minVersion '${configEntry.minVersion}' should be a valid version`)
          }
          if (typeof configEntry.maxVersion !== 'string' && typeof configEntry.maxVersion !== 'undefined') {
            errors.push(`In section ${key}, the maxVersion '${configEntry.maxVersion}' should be a valid version if entered`)
          }
        } else if ((key === 'templates' && configEntry.path[0] === '/') ||
          (key === 'scripts' && configEntry.path !== undefined && configEntry.path[0] === '/')) {
          checkPathExists(executionPath, configEntry.path, key)
        } else if (key === 'nunjucksMacros') {
          checkNunjucksMacroExists(executionPath, configEntry.importFrom, pluginConfig.nunjucksPaths)
        } else if (typeof configEntry === 'string' && configEntry[0] === '/') {
          checkPathExists(executionPath, configEntry, key)
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
  console.log()
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
    console.log()
    console.log(ansiColors.green('The plugin config is valid.'))
    console.log()
  } else {
    process.exitCode = 100
    console.error()
    errors.forEach(err => console.error(ansiColors.red(`Error: ${err}`)))
    console.error()
  }
}

module.exports = {
  validatePlugin
}
