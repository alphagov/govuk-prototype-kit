/**
 *
 * A schema for an example manifest file follows:
 *
 *     // govuk-prototype-kit.config.json
 *     {
 *       "assets": path | path[],
 *       "importNunjucksMacrosInto": path | path[],
 *       "nunjucksPaths": path | path[],
 *       "nunjucksFilters": path | path[],
 *       "sass": path | path[],
 *       "scripts": path | path[],
 *       "stylesheets": path | path[],
 *       "templates": {
 *         "name": string,
 *         "path": path,
 *         "type": string
 *       }[]
 *     }
 *
 * Note that all of the top-level keys are optional.
 *
 */

const fse = require('fs-extra')
const path = require('path')

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

function readConfigAsJSON (configPath) {
  return JSON.parse(fse.readFileSync(configPath).toString())
}

function validateConfigKeys(pluginConfig) {
  console.log('Config file exists, validating contents.')
  const knownKeys = getKnownKeys()
  const keysToValidate = Object.keys(pluginConfig);
  let invalidKeys = []
  keysToValidate.forEach(keyToValidate => {
    if (!knownKeys.includes(keyToValidate)) {
      invalidKeys.push(keyToValidate)
    }
  })
  if (invalidKeys.length > 0) {
    console.log(`The following invalid keys exist in your config: ${invalidKeys}`)
  }
}

function validateConfigPaths(pluginConfig) {
  console.log('Validating config paths exist.')
  const keysToValidate = Object.keys(pluginConfig)
  keysToValidate.forEach(key => {
    pluginConfig[key].forEach((pathToValidate, index) => {
      try {
        if (pathToValidate[0] === '/') {
          // Check file exists 
        } else {
          // Check if templates
          if (key === 'templates') {
            if (pathToValidate.path[0] === '/') {
              // Check file exists
            } else {
              console.log(`In section ${key}, template ${pathToValidate.name} has a path "${pathToValidate.path}" that does not start with a '/'`)
            }
          } else {
            // else throw response below
            console.log(`In section ${key}, the path "${pathToValidate}" does not start with a '/'`)
          }
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
            console.log('The plugin does not seem to have a govuk-prototype-kit.config.json file, all plugins must have this file to be valid.')
          }
        })
      } else {
        console.log(`Could not find plugin named ${pluginName}`)
      }
    })
  } else {
    console.log('validate-plugin requires a plugin name e.g. npx govuk-prototype validate-plugin <plugin_name>')
  }
}

module.exports = {
  validatePlugin
}
