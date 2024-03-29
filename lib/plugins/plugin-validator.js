const fs = require('fs')
const path = require('path')

const fse = require('fs-extra')
const ansiColors = require('ansi-colors')

const errors = []

const knownKeys = [
  'assets',
  'importNunjucksMacrosInto',
  'nunjucksPaths',
  'nunjucksMacros',
  'nunjucksFilters',
  'nunjucksFunctions',
  'sass',
  'scripts',
  'stylesheets',
  'templates',
  'pluginDependencies',
  'meta'
]

/**
 * @param {string} executionPath
 * @param {string} pathToValidate
 * @param {string} key
 */
function checkPathExists (executionPath, pathToValidate, key) {
  const absolutePathToValidate = path.join(executionPath, pathToValidate)
  if (!fse.existsSync(absolutePathToValidate)) errors.push(`In section ${key}, the path '${pathToValidate}' does not exist`)
}

/**
 * @param {string} executionPath
 * @param {string} nunjucksFileName
 * @param {string | string[]} nunjucksPaths
 */
function checkNunjucksMacroExists (executionPath, nunjucksFileName, nunjucksPaths) {
  // set up a flag for the existance of a nunjucks path
  let nunjucksPathExists = false

  if (!nunjucksPaths || typeof nunjucksPaths === 'string') {
    const pathToCheck = typeof nunjucksPaths === 'string'
      ? path.join(executionPath, nunjucksPaths, nunjucksFileName)
      : path.join(executionPath, nunjucksFileName) // root level

    // Check if the nunjucksMacros are at a single path in the project
    if (fse.existsSync(pathToCheck)) nunjucksPathExists = true
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

/**
 * @param {string[]} invalidKeys
 */
function reportInvalidKeys (invalidKeys) {
  errors.push(`The following invalid keys exist in your config: ${invalidKeys}`)
}

/**
 * @param {ConfigManifest} pluginConfig
 * @param {ArgvParsed} argv
 * @returns {ConfigManifest}
 */
function validateConfigKeys (pluginConfig, argv) {
  console.log('Config file exists, validating contents.')
  const keysToAllowThrough = `${argv?.options?.keysToIgnoreIfUnknown || ''}`
  const allowedKeys = [...knownKeys, ...keysToAllowThrough.split(',').filter(key => !!key)]
  const invalidKeys = []

  const validKeysPluginConfig = Object.fromEntries(Object.entries(pluginConfig).filter(([key]) => {
    if (allowedKeys.includes(key)) {
      return true
    }
    invalidKeys.push(key)
    return false
  }))

  // Add any invalid config keys to the list of errors
  if (invalidKeys.length > 0) {
    reportInvalidKeys(invalidKeys)
  }

  return validKeysPluginConfig
}

/**
 * @template {ConfigEntry | ConfigURLs} ObjectType
 * @param {ObjectType} objectToEvaluate
 * @param {string[]} allowedKeys
 * @param {string} [keyPath]
 */
function reportUnknownKeys (objectToEvaluate, allowedKeys, keyPath) {
  const invalidMetaUrlKeys = Object.keys(objectToEvaluate).filter(key => !allowedKeys.includes(key)).map(key => `${keyPath || ''}${key}`)
  if (invalidMetaUrlKeys.length > 0) {
    reportInvalidKeys(invalidMetaUrlKeys)
  }
}

/**
 * @param {string} url
 */
function isValidUrl (url) {
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    return false
  }
  if (!url.split('://')[1].split('/')[0].includes('.')) {
    return false
  }
  return true
}

/**
 * @param {ConfigURLs} [metaUrls]
 */
function validateMetaUrls (metaUrls) {
  if (typeof metaUrls === 'undefined') {
    return
  }

  if (typeof metaUrls !== 'object' || Array.isArray(metaUrls)) {
    errors.push('The meta.urls must be an object if entered')
    return
  }

  const keyPath = 'meta.urls.'
  reportUnknownKeys(metaUrls, [
    'documentation',
    'releaseNotes',
    'versionHistory'
  ], keyPath)

  const allowedVariables = ['version', 'kitVersion'].map(variable => `{{${variable}}}`)

  Object.keys(metaUrls).forEach(key => {
    const url = metaUrls[key]
    if (!isValidUrl(url)) {
      errors.push(`meta.urls.${key} doesn't appear to be a public URL`)
    }

    const unknownVariables = (url.match(/{{(\w+)}}/g) || []).filter(variable => !allowedVariables.includes(variable))

    unknownVariables.forEach(variable => errors.push(`The URL ${keyPath}${key} contains an unknown variable ${variable}`))
  })
}

/**
 * @param {ConfigEntry} meta
 */
function validateMeta (meta) {
  const metaKeys = ['urls', 'description']

  if (typeof meta !== 'object' || Array.isArray(meta)) {
    errors.push('The meta must be an object if entered')
    return
  }

  if (typeof meta.description !== 'string' && typeof meta.description !== 'undefined') {
    errors.push('The meta.description must be a string if entered')
    return
  }

  const invalidMetaUrlKeys = Object.keys(meta).filter(key => !metaKeys.includes(key)).map(key => `meta.${key}`)
  if (invalidMetaUrlKeys.length > 0) {
    reportInvalidKeys(invalidMetaUrlKeys)
  }

  validateMetaUrls(meta.urls)
}

/**
 * @param {string} key
 * @param {ConfigEntry} configEntry
 */
function validatePluginDependency (key, configEntry) {
  if (typeof configEntry !== 'object' || Array.isArray(configEntry)) {
    return
  }
  // Can be a string, but if an object, the packageName must be a string
  if (!Object.keys(configEntry).includes('packageName')) {
    errors.push(`In section ${key}, the packageName property should exist`)
    return
  }
  const { packageName, minVersion, maxVersion } = configEntry
  if (typeof packageName !== 'string') {
    errors.push(`In section ${key}, the packageName '${packageName}' should be a valid package name`)
  }
  // The minVersion is optional but must be a string if entered
  if (Object.keys(configEntry).includes('minVersion') && typeof minVersion !== 'string') {
    errors.push(`In section ${key}, the minVersion '${minVersion}' should be a valid version if entered`)
  }
  // The maxVersion is optional but must be a string if entered
  if (Object.keys(configEntry).includes('maxVersion') && typeof maxVersion !== 'string' && typeof maxVersion !== 'undefined') {
    errors.push(`In section ${key}, the maxVersion '${maxVersion}' should be a valid version if entered`)
  }
}

/**
 * @param {ConfigManifest} pluginConfig
 * @param {string} executionPath
 */
function validateConfigurationValues (pluginConfig, executionPath) {
  console.log('Validating whether config paths meet criteria.')
  const keysToValidate = Object.keys(pluginConfig)

  keysToValidate.forEach(key => {
    /**
     * Convert any strings to an array so that they can be processed
     * @type {ConfigEntry[]}
     */
    const criteriaConfig = [pluginConfig[key]].flat()

    criteriaConfig.forEach((configEntry) => {
      try {
        if (key === 'meta') {
          validateMeta(configEntry)
        } else if (key === 'pluginDependencies') {
          validatePluginDependency(key, configEntry)
        } else if ((key === 'templates' && configEntry.path[0] === '/') ||
          (key === 'scripts' && configEntry.path !== undefined && configEntry.path[0] === '/')) {
          checkPathExists(executionPath, configEntry.path, key)
        } else if (key === 'nunjucksMacros') {
          checkNunjucksMacroExists(executionPath, configEntry.importFrom, pluginConfig.nunjucksPaths)
        } else if (typeof configEntry === 'string' && configEntry[0] === '/') {
          checkPathExists(executionPath, configEntry, key)
        } else if (knownKeys.includes(key)) {
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

/**
 * @param {string} executionPath
 * @param {ArgvParsed} argv
 */
async function validatePlugin (executionPath, argv) {
  console.log()
  const configPath = path.join(executionPath, 'govuk-prototype-kit.config.json')
  await fse.exists(configPath).then(exists => {
    if (exists) {
      /** @type {ConfigManifest | undefined} */
      let pluginConfig
      try {
        pluginConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      } catch (error) {
        // Catch any syntax errors in the config
        errors.push('Your govuk-prototype-kit.config.json file is not valid json.')
      }

      // Check if the json has contents
      let isConfigEmpty = false
      const { meta, ...configWithoutMeta } = pluginConfig || {}
      if (JSON.stringify(configWithoutMeta) === '{}') {
        isConfigEmpty = true
      }

      // Continue with the validation if there are no syntax errors in the config
      if (pluginConfig) {
        if (isConfigEmpty) {
          const caveat = meta ? ' other than the metadata' : ''
          errors.push(`There are no contents in your govuk-prototype.config file${caveat}!`)
        } else {
          // Perform the rest of the checks if the config file has contents
          const validKeysPluginConfig = validateConfigKeys(pluginConfig, argv)
          validateConfigurationValues(validKeysPluginConfig, executionPath)
        }
      }
    } else {
      errors.push('The plugin does not have a govuk-prototype-kit.config.json file, all plugins must have this file to be valid.')
    }
  })
  if (!errors.length) {
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

function clearErrors () {
  while (errors.length) {
    errors.pop()
  }
}

function getErrors () {
  return [...errors]
}

module.exports = {
  clearErrors,
  getErrors,
  validatePlugin,
  validateMeta,
  validatePluginDependency
}

/**
 * @typedef {import('./plugins').ConfigManifest} ConfigManifest
 * @typedef {import('./plugins').ConfigURLs} ConfigURLs
 * @typedef {import('./plugins').ConfigEntry} ConfigEntry
 * @typedef {import('../../bin/utils/argv-parser').ArgvParsed} ArgvParsed
 */
