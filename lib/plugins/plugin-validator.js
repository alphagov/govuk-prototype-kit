/**
 * plugins.js (Use with caution)
 *
 *  Experimental feature which is likely to change.
 *  This file returns helper methods to enable services to include
 *  their own departmental frontend(Styles, Scripts, nunjucks etc)
 *
 * Plugins are packages in the `node_modules` folder that contain a
 * `govuk-prototype-kit.config.json` manifest file. By adding paths within the
 * package to the manifest, plugins can expose additional files to the kit.
 * The kit code retrieves the paths as and when needed; this module just
 * contains the code to find and list paths defined by plugins.
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

function readConfigAsJSON(configPath) {
  return JSON.parse(fse.readFileSync(configPath).toString())
}

function validateConfigKeys(pluginConfig) {
  console.log(`Config file exists, validating contents.`)
  const knownKeys = getKnownKeys()
  const keysToValidate = Object.keys(pluginConfig);
  let invalidKeys = []
  keysToValidate.forEach(keyToValidate => {
    if (!knownKeys.includes(keyToValidate)) {
      invalidKeys.push(keyToValidate)
    }
  })
  if (invalidKeys) {
    console.log(`The following invalid keys exist in your config: ${invalidKeys}`)
  }
}

function validateConfigPaths(pluginConfig) {
  console.log(`Validating config paths exist.`)
  const keysToValidate = Object.keys(pluginConfig)
  keysToValidate.forEach(key => {
    pluginConfig[key].forEach((pathToValidate, index) => {
      try {
        if (pathToValidate[0] === '/') {
          // Check file exists
        } else {
          // Path doesn't start with /
          // Check if templates
          if (key == 'templates') {
            console.log('Template has different structure')
          } else {
            //else throw response below
            console.log(`In section ${key} the path "${pathToValidate}" does not start with a '/'`)
          }
        }
      } catch(e) {
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
            const configPath = path.join(pathToPlugin,'govuk-prototype-kit.config.json')
            fse.exists(configPath). then(exists => {
              if (exists) {
                const pluginConfig = readConfigAsJSON(configPath)
                validateConfigKeys(pluginConfig)
                validateConfigPaths(pluginConfig)
              } else {
                console.log(`The plugin does not seem to have a govuk-prototype-kit.config.json file, all plugins must have this file to be valid.`)
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