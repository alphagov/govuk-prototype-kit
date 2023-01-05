/**
 * plugins.js (Use with caution)
 *
 *  Experimental feature which is likely to change.
 *  This file returns helper methods to enable services to include
 *  their own departmental frontend(Styles, Scripts, nunjucks etc)
 *
 * Module.exports
 *    getPublicUrls:
 *      Params: (type | string ) eg. 'scripts', 'stylesheets'
 *      Description:
 *        returns array of urls for a type (script, stylesheet, nunjucks etc).
 *    getFileSystemPaths:
 *      Params: (type | string ) eg. 'scripts', 'stylesheets'
 *      Description:
 *        returns array paths to the file in the filesystem for a type (script, stylesheet, nunjucks etc)
 *    getPublicUrlAndFileSystemPaths:
 *      Params: (type | string ) eg. 'scripts', 'stylesheets'
 *      Description:
 *        returns Array of objects, each object is an plugin and each obj has the filesystem & public url for the given type
 *    getAppConfig:
 *      Params: (type | string ) eg. 'scripts', 'stylesheets'
 *      Description:
 *        Returns an object containing two keys(scripts & stylesheets), each item contains an array of full paths to specific files.
 *        This is used in the views to output links and scripts each file.
 *    getAppViews:
 *      Params: (additionalViews | Array ) eg.plugins.getAppViews([path.join(__dirname, '/app/views/'),path.join(__dirname, '/lib/')])
 *      Description:
 *        Returns an array of paths to nunjucks templates which is used to configure nunjucks in server.js
 *    setPluginsByType
 *      Params: N/A
 *      Description: only used for test purposes to reset mocked plugins items to ensure they are up-to-date when the tests run
 *
 * *
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
const pathToPackageConfigFile = packageName => getPathFromProjectRoot('node_modules', packageName, 'govuk-prototype-kit.config.json')
const moduleToPluginConversion = {
  jquery: {
    scripts: ['/dist/jquery.js'],
    assets: ['/dist']
  }
}

const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

function getPackageConfig (packageName) {
  if (fs.existsSync(pathToPackageConfigFile(packageName))) {
    return readJsonFile(pathToPackageConfigFile(packageName))
  }
  if (Object.prototype.hasOwnProperty.call(moduleToPluginConversion, packageName)) {
    return moduleToPluginConversion[packageName]
  }
  return {}
}

// Handle errors to do with plugin paths
// Example of `subject`: { packageName: 'govuk-frontend', item: '/all.js' }
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

// Get all npm dependencies
// Get basePlugins in the order defined in `basePlugins` in config.js
// Then place basePlugins before npm dependencies (and remove duplicates)
function getPackageNamesInOrder () {
  const pkg = fs.existsSync(pkgPath) ? readJsonFile(pkgPath) : {}
  const dependencies = pkg.dependencies || {}
  const allNpmDependenciesInAlphabeticalOrder = Object.keys(dependencies).sort()
  const installedBasePlugins = getBasePlugins()
    .filter(packageName => allNpmDependenciesInAlphabeticalOrder.includes(packageName))

  return removeDuplicates(installedBasePlugins.concat(allNpmDependenciesInAlphabeticalOrder))
}

// Plugins provide items such as sass scripts, asset paths etc.
// This function groups them by type in a format which can used by getList
// Example of return
//    {
//     nunjucksPaths: [
//      { packageName: 'govuk-frontend', item: '/' },
//      { packageName: 'govuk-frontend', item: '/components'}
//    ],
//    scripts: [
//      { packageName: 'govuk-frontend', item: '/all.js' }
//    ]
//    assets: [
//      { packageName: 'govuk-frontend', item: '/assets' }
//    ],
//    sass: [
//      { packageName: 'govuk-frontend', item: '/all.scss' }
//    ]}
function getPluginsByType () {
  return getPackageNamesInOrder()
    .reduce((accum, packageName) => Object.assign({}, accum, objectMap(
      getPackageConfig(packageName),
      (listOfItemsForType, type) => (accum[type] || [])
        .concat([].concat(listOfItemsForType).map(item => ({
          packageName,
          item
        })))
    )), {})
}

let pluginsByType

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
  jquery: 'jQuery'
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

function preparePackageNameForDisplay (packageName) {
  const safePackageName = (packageName || '')

  if (safePackageName.startsWith('@')) {
    const name = prepareName(safePackageName.split('/')[1])
    const scope = prepareName(safePackageName.split('/')[0].split('@')[1])
    return {
      name,
      scope
    }
  } else {
    return {
      name: prepareName(safePackageName)
    }
  }
}

function listInstalledPlugins () {
  const plugins = []
  Object.keys(pluginsByType).forEach(key => {
    pluginsByType[key].forEach(config => {
      const currentPlugin = config.packageName
      if (!plugins.includes(currentPlugin)) {
        plugins.push(currentPlugin)
      }
    })
  })
  return plugins
}

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
  return Object.keys(dependencies).filter((dependency) => fse.pathExistsSync(pathToPackageConfigFile(dependency)))
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

const getPublicUrls = type => getList(type).map(getPublicUrl)

const getFileSystemPaths = type => getList(type).map(getFileSystemPath)

const getPublicUrlAndFileSystemPaths = type => getList(type).map(getPublicUrlAndFileSystemPath)

function getAppConfig (additionalConfig) {
  return {
    scripts: self.getPublicUrls('scripts').concat((additionalConfig || {}).scripts || []),
    stylesheets: self.getPublicUrls('stylesheets').concat((additionalConfig || {}).stylesheets || [])
  }
}

const getAppViews = additionalViews => expandToIncludeShadowNunjucks(self
  .getFileSystemPaths('nunjucksPaths'))
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
