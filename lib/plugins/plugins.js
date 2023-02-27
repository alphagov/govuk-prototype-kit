/**
 * plugins.js (Use with caution)
 *
 *  Experimental feature which is likely to change.
 *  This file returns helper methods to enable services to include
 *  their own departmental frontend(Styles, Scripts, nunjucks etc)
 *
 * Plugins are packages in the `node_modules` folder that contain a
 * `govuk-prototype.config.json` manifest file. By adding paths within the
 * package to the manifest, plugins can expose additional files to the kit.
 * The kit code retrieves the paths as and when needed; this module just
 * contains the code to find and list paths defined by plugins.
 *
 * A schema for an example manifest file follows:
 *
 *     // govuk-prototype.config.json
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

// core dependencies
const fs = require('fs')
const path = require('path')

// npm dependencies
const chokidar = require('chokidar')
const fse = require('fs-extra')

// local dependencies
const appConfig = require('../config')
const { projectDir, packageDir, shadowNunjucksDir } = require('../utils/paths')
const knownPlugins = require(path.join(packageDir, 'known-plugins.json'))

const pkgPath = path.join(projectDir, 'package.json')

// Generic utilities
const removeDuplicates = arr => [...new Set(arr)]
const filterOutParentAndEmpty = part => part && part !== '..'
const objectMap = (object, mapFn) => Object.keys(object).reduce((result, key) => {
  result[key] = mapFn(object[key], key)
  return result
}, {})

// File utilities
const getPathFromProjectRoot = (...all) => path.join(...[projectDir].concat(all))
const pathToPluginConfigFile = packageName => getPathFromProjectRoot('node_modules', packageName, 'govuk-prototype-kit.config.json')

const moduleToPluginConversion = {
  jquery: {
    scripts: ['/dist/jquery.js'],
    assets: ['/dist']
  }
}

const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

function getPluginConfig (packageName) {
  const pluginConfigFile = pathToPluginConfigFile(packageName)
  if (fs.existsSync(pluginConfigFile)) {
    return readJsonFile(pluginConfigFile)
  }
  if (moduleToPluginConversion[packageName]) {
    return moduleToPluginConversion[packageName]
  }
  return {}
}

/**
 * Handle errors to do with plugin paths
 * @param {{ packageName: string, item: string }} subject - For example { packageName: 'govuk-frontend', item: '/all.js' }
 * @throws if path in item is badly formatted
 */
function throwIfBadFilepath (subject) {
  if (('' + subject.item).indexOf('\\') > -1) {
    throw new Error(`Can't use backslashes in plugin paths - "${subject.packageName}" used "${subject.item}".`)
  }
  if (!('' + subject.item).startsWith('/')) {
    throw new Error(`All plugin paths must start with a forward slash - "${subject.packageName}" used "${subject.item}".`)
  }
}

// Check for `basePlugins` in config.js. If it's not there, default to `govuk-frontend`
const getBasePlugins = () => appConfig.getConfig().basePlugins

function getKnownPlugins () {
  return knownPlugins.plugins
}

/**
 * Get all npm dependencies
 *
 * @private
 *
 * Get basePlugins in the order defined in `basePlugins` in config.js
 * Then place basePlugins before npm dependencies (and remove duplicates)
 *
 * @returns string[] list of package names
 */
function getPackageNamesInOrder () {
  const pkg = fs.existsSync(pkgPath) ? readJsonFile(pkgPath) : {}
  const dependencies = pkg.dependencies || {}
  const allNpmDependenciesInAlphabeticalOrder = Object.keys(dependencies).sort()
  const installedBasePlugins = getBasePlugins()
    .filter(packageName => allNpmDependenciesInAlphabeticalOrder.includes(packageName))

  return removeDuplicates(installedBasePlugins.concat(allNpmDependenciesInAlphabeticalOrder))
}

/**
 * This function groups plugins by type in a format which can used by getList
 *
 * @private
 *
 * Plugins provide items such as sass scripts, asset paths etc.
 *
 * @returns Object.<string, *[]> - for example
 *    {
 *     nunjucksPaths: [
 *      { packageName: 'govuk-frontend', item: '/' },
 *      { packageName: 'govuk-frontend', item: '/components'}
 *    ],
 *    scripts: [
 *      { packageName: 'govuk-frontend', item: '/all.js' }
 *    ]
 *    assets: [
 *      { packageName: 'govuk-frontend', item: '/assets' }
 *    ],
 *    sass: [
 *      { packageName: 'govuk-frontend', item: '/all.scss' }
 *    ]}
 *
 */
function getPluginsByType () {
  return getPackageNamesInOrder()
    .reduce((accum, packageName) => Object.assign({}, accum, objectMap(
      getPluginConfig(packageName),
      (listOfItemsForType, type) => (accum[type] || [])
        .concat([].concat(listOfItemsForType).map(item => ({
          packageName,
          item
        })))
    )), {})
}

let pluginsByType

/**
 * Only used for test purposes to reset mocked plugins items to ensure they are up-to-date when the tests run
 *
 * @private
 */
function setPluginsByType () {
  pluginsByType = getPluginsByType()
}

setPluginsByType()

const getPublicUrl = config => {
  return ['', 'plugin-assets', config.packageName]
    .concat(config.item.split('/').filter(filterOutParentAndEmpty))
    .map(encodeURIComponent)
    .join('/')
}

function getFileSystemPath (config) {
  throwIfBadFilepath(config)
  return getPathFromProjectRoot('node_modules',
    config.packageName,
    config.item.split('/').filter(filterOutParentAndEmpty).join(path.sep))
}

function getPublicUrlAndFileSystemPath (config) {
  return {
    fileSystemPath: getFileSystemPath(config),
    publicUrl: getPublicUrl(config)
  }
}

const getList = type => pluginsByType[type] || []

const knownWordsToFormat = {
  govuk: 'GOV.UK',
  hmrc: 'HMRC',
  moj: 'MOJ',
  hmcts: 'HMCTS',
  dfe: 'DfE',
  ho: 'HO',
  ons: 'ONS',
  jquery: 'jQuery',
  dwp: 'DWP'
}

function prepareWordForPackageNameDisplay (word) {
  const safeWord = word || ''
  const lowercaseWord = safeWord.toLowerCase()
  const knownWord = knownWordsToFormat[lowercaseWord]
  if (knownWord) {
    return knownWord
  }
  return (safeWord[0] || '').toUpperCase() + safeWord.substring(1).toLowerCase()
}

function prepareName (name) {
  return name
    .split('-')
    .map(prepareWordForPackageNameDisplay).join(' ')
}

function preparePackageNameForDisplay (packageName, version) {
  const safePackageName = (packageName || '')

  const packageNameDetails = {}

  if (safePackageName.startsWith('@')) {
    packageNameDetails.name = prepareName(safePackageName.split('/')[1])
    packageNameDetails.scope = prepareName(safePackageName.split('/')[0].split('@')[1])
  } else {
    packageNameDetails.name = prepareName(safePackageName)
  }

  if (version) {
    packageNameDetails.version = version
  }

  return packageNameDetails
}

const listInstalledPlugins = () => getPackageNamesInOrder()
  .filter((packageName) => Object.keys(getPluginConfig(packageName)).length || getKnownPlugins().available.includes(packageName))

function expandToIncludeShadowNunjucks (arr) {
  const out = []
  arr.forEach(orig => {
    out.push(orig)
    const end = orig.split('node_modules')[1]
    out.push(path.join(shadowNunjucksDir, end))
  })
  return out
}

function getCurrentPlugins () {
  const pkg = fs.existsSync(pkgPath) ? fse.readJsonSync(pkgPath) : {}
  const dependencies = pkg.dependencies || {}
  return Object.keys(dependencies).filter((dependency) => fse.pathExistsSync(pathToPluginConfigFile(dependency)))
}

let previousPlugins = getCurrentPlugins()

function watchPlugins (afterWatch) {
  chokidar.watch(pkgPath, {
    ignoreInitial: true,
    disableGlobbing: true, // Prevents square brackets from being mistaken for globbing characters
    awaitWriteFinish: true
  }).on('change', () => {
    const currentPlugins = getCurrentPlugins()

    const missing = previousPlugins.filter((plugin) => !currentPlugins.includes(plugin))
    if (missing.length) {
      if (missing.length === 1) {
        console.log(`Plugin ${missing} has been removed`)
      } else {
        console.log(`Plugins ${missing.join(', ')} have been removed`)
      }
    }

    const added = currentPlugins.filter((plugin) => !previousPlugins.includes(plugin))
    if (added.length) {
      if (added.length === 1) {
        console.log(`Plugin ${added} has been added`)
      } else {
        console.log(`Plugins ${added.join(', ')} have been added`)
      }
    }

    previousPlugins = currentPlugins

    afterWatch({ missing, added })
  })
}

const getByType = type => getList(type)

/**
 * Gets public urls for all plugins of type
 * @param {string} type - (scripts, stylesheets, nunjucks etc)
 * @return {string[]} A list of urls
 */
const getPublicUrls = type => getList(type).map(getPublicUrl)

/**
 * Gets filesystem paths for all plugins of type
 * @param {string} type - (scripts, stylesheets, nunjucks etc)
 * @return {string[]} An array of filesystem paths
 */
const getFileSystemPaths = type => getList(type).map(getFileSystemPath)

/**
 * Gets public urls and filesystem paths for all plugins of type
 * @param {string} type - (scripts, stylesheets, nunjucks etc)
 * @return {{fileSystemPath: string, publicUrl: string}[]} An array of urls and filesystem paths
 */
const getPublicUrlAndFileSystemPaths = type => getList(type).map(getPublicUrlAndFileSystemPath)

/**
 * This is used in the views to output links and scripts for each file
 * @param {{scripts: string[], stylesheets: string[]}} additionalConfig
 * @return {{scripts: string[], stylesheets: string[]}} Returns an object containing two keys(scripts & stylesheets),
 *   each item contains an array of full paths to specific files.
 */
function getAppConfig (additionalConfig) {
  return {
    scripts: self.getPublicUrls('scripts').concat((additionalConfig || {}).scripts || []),
    stylesheets: self.getPublicUrls('stylesheets').concat((additionalConfig || {}).stylesheets || [])
  }
}

/**
 * This is used to configure nunjucks in server.js
 * @param {string[]} additionalViews
 * @return {string[]} Returns an array of paths to nunjucks templates
 */
const getAppViews = additionalViews => expandToIncludeShadowNunjucks(self.getFileSystemPaths('nunjucksPaths'))
  .reverse()
  .concat(additionalViews || [])

function legacyGovukFrontendFixesNeeded () {
  try {
    const config = require(path.join(projectDir, 'node_modules/govuk-frontend/govuk-prototype-kit.config.json'))
    return !config.nunjucksMacros
  } catch (e) {
    return false
  }
}

// Exports
const self = module.exports = {
  preparePackageNameForDisplay,
  listInstalledPlugins,
  getKnownPlugins,
  getByType,
  getPublicUrls,
  getFileSystemPaths,
  getPublicUrlAndFileSystemPaths,
  getAppConfig,
  getAppViews,
  legacyGovukFrontendFixesNeeded,
  setPluginsByType,
  watchPlugins
}
