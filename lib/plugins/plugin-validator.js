const fse = require('fs-extra')
const path = require('path')

const errors = []

function getKnownKeys () {
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

function readConfigAsJSON (configPath) {
  return JSON.parse(fse.readFileSync(configPath).toString())
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

  // Print any invalid config keys
  if (invalidKeys.length > 0) {
    errors.push(`The following invalid keys exist in your config: ${invalidKeys}`)
  }
}

function validateConfigPaths (pluginConfig) {
  console.log('Validating config paths meet criteria.')
  const keysToValidate = Object.keys(pluginConfig)
  keysToValidate.forEach(key => {
    let criteriaConfig = pluginConfig[key]
    if (!Array.isArray(criteriaConfig)) {
      criteriaConfig = [criteriaConfig]
    }
    criteriaConfig.forEach((pathToValidate, index) => {
      try {
        if (pathToValidate[0] === '/') {
          // Check that file exists
          console.log('checking that config paths exist')
          fse.existsSync(pathToValidate) ? console.log('') : errors.push(`In section ${key}, the path "${pathToValidate}" does not exist`)
          console.log('config paths exist')
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

async function validatePlugin () {
  const executionPath = process.cwd()
  const configPath = path.join(executionPath, 'govuk-prototype-kit.config.json')
  await fse.exists(configPath).then(exists => {
    if (exists) {
      const pluginConfig = readConfigAsJSON(configPath)
      validateConfigKeys(pluginConfig)
      validateConfigPaths(pluginConfig)
    } else {
      errors.push('The plugin does not have a govuk-prototype-kit.config.json file, all plugins must have this file to be valid.')
    }
  })
  console.log(errors, null, 2)
  return errors
}

module.exports = {
  validatePlugin
}
