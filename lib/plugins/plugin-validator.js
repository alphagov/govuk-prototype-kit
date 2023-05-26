const fse = require('fs-extra')
const path = require('path')

const errors = []

function getKnownKeys() {
  const knownKeys = [
    'assets',
    'importNunjucksMacrosInto',
    'nunjucksPaths',
    'nunjucksFilters',
    'sass',
    'scripts',
    'stylesheets',
    'templates'
  ]

  return knownKeys
}

function readConfigAsJSON(configPath) {
  return JSON.parse(fse.readFileSync(configPath).toString())
}

function validateConfigKeys(pluginConfig) {
  console.log('Config file exists, validating contents.')
  const knownKeys = getKnownKeys()
  const keysToValidate = Object.keys(pluginConfig)
  const invalidKeys = []
  keysToValidate.forEach(keyToValidate => {
    if (!knownKeys.includes(keyToValidate)) {
      invalidKeys.push(keyToValidate)
    }
  })

  // Print any invalid config keys
  if (invalidKeys.length > 0) {
    errors.push(`The following invalid keys exist in your config: ${invalidKeys}`)
  }
}

function validateConfigPaths(pluginConfig) {
  console.log('Validating config paths exist.')
  const keysToValidate = Object.keys(pluginConfig)
  keysToValidate.forEach(key => {
    pluginConfig[key].forEach((pathToValidate, index) => {
      try {
        if (pathToValidate[0] === '/') {
          // Check that file exists
          fse.existsSync(pathToValidate) ? console.log('') : errors.push(`In section ${key}, the path "${pathToValidate}" does not exist`)
        } else if (key === 'templates' && pathToValidate.path[0] === '/') {
          // Check if template paths are valid differently as the schema for these is different
          const templatePathToValidate = pathToValidate.path[0]
          fse.existsSync(templatePathToValidate) ? console.log('') : errors.push(`In section ${key}, the path "${templatePathToValidate}" does not exist`)
        } else {
          const invalidPath = (key === 'templates') ? pathToValidate.path : pathToValidate
          errors.push(`In section ${key}, the path "${invalidPath}" does not start with a '/'`)
        }
      } catch (e) {
        console.log(e)
      }
    })
  })
}

function validatePlugin(pluginName) {
  if (pluginName != null) {
    const executionPath = process.cwd()
    const pathToPlugin = path.join(executionPath, pluginName)
    console.log(`Trying to validate that ${pathToPlugin} exists`)
    fse.exists(pathToPlugin).then(exists => {
      if (exists) {
        const configPath = path.join(pathToPlugin, 'govuk-prototype-kit.config.json')
        fse.exists(configPath).then(exists => {
          if (exists) {
            const pluginConfig = readConfigAsJSON(configPath)
            validateConfigKeys(pluginConfig)
            validateConfigPaths(pluginConfig)
          } else {
            errors.push('The plugin does not seem to have a govuk-prototype-kit.config.json file, all plugins must have this file to be valid.')
          }
        })
      } else {
        errors.push(`Could not find plugin named ${pluginName}`)
      }
    })
  } else {
    errors.push('validate-plugin requires a plugin name e.g. npx govuk-prototype validate-plugin <plugin_name>')
  }
  return errors
}

module.exports = {
  validatePlugin
}
