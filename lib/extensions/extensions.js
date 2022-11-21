/**
 * Extensions.js (Use with caution)
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
 *        returns Array of objects, each object is an extension and each obj has the filesystem & public url for the given type
 *    getAppConfig:
 *      Params: (type | string ) eg. 'scripts', 'stylesheets'
 *      Description:
 *        Returns an object containing two keys(scripts & stylesheets), each item contains an array of full paths to specific files.
 *        This is used in the views to output links and scripts each file.
 *    getAppViews:
 *      Params: (additionalViews | Array ) eg.extensions.getAppViews([path.join(__dirname, '/app/views/'),path.join(__dirname, '/lib/')])
 *      Description:
 *        Returns an array of paths to nunjucks templates which is used to configure nunjucks in server.js
 *    setExtensionsByType
 *      Params: N/A
 *      Description: only used for test purposes to reset mocked extensions items to ensure they are up-to-date when the tests run
 *
 * *
 */

// Core dependencies
const fs = require('fs')
const path = require('path')

// Local dependencies
const appConfig = require('../config')
const { projectDir } = require('../path-utils')
const pkgPath = path.join(projectDir, 'package.json')
const chokidar = require('chokidar')
const fse = require('fs-extra')
const { shadowNunjucks } = require('../build/config.json').paths

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
const moduleToExtensionConversion = {
  jquery: {
    scripts: ['/dist/jquery.js'],
    assets: ['/dist']
  }
}

const readJsonFile = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}
const getPackageConfig = packageName => {
  if (fs.existsSync(pathToPackageConfigFile(packageName))) {
    return readJsonFile(pathToPackageConfigFile(packageName))
  }
  if (Object.prototype.hasOwnProperty.call(moduleToExtensionConversion, packageName)) {
    return moduleToExtensionConversion[packageName]
  }
  return {}
}

// Handle errors to do with extension paths
// Example of `subject`: { packageName: 'govuk-frontend', item: '/all.js' }
const throwIfBadFilepath = subject => {
  if (('' + subject.item).indexOf('\\') > -1) {
    throw new Error(`Can't use backslashes in extension paths - "${subject.packageName}" used "${subject.item}".`)
  }
  if (!('' + subject.item).startsWith('/')) {
    throw new Error(`All extension paths must start with a forward slash - "${subject.packageName}" used "${subject.item}".`)
  }
}

// Check for `baseExtensions` in config.js. If it's not there, default to `govuk-frontend`
const getBaseExtensions = () => appConfig.getConfig().basePlugins

// Get all npm dependencies
// Get baseExtensions in the order defined in `baseExtensions` in config.js
// Then place baseExtensions before npm dependencies (and remove duplicates)
const getPackageNamesInOrder = () => {
  const pkg = fs.existsSync(pkgPath) ? readJsonFile(pkgPath) : {}
  const dependencies = pkg.dependencies || {}
  const allNpmDependenciesInAlphabeticalOrder = Object.keys(dependencies).sort()
  const installedBaseExtensions = getBaseExtensions()
    .filter(packageName => allNpmDependenciesInAlphabeticalOrder.includes(packageName))

  return removeDuplicates(installedBaseExtensions.concat(allNpmDependenciesInAlphabeticalOrder))
}

// Extensions provide items such as sass scripts, asset paths etc.
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
const getExtensionsByType = () => {
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

let extensionsByType

const setExtensionsByType = () => {
  extensionsByType = getExtensionsByType()
}

setExtensionsByType()

const getPublicUrl = config => {
  return ['', 'extension-assets', config.packageName]
    .concat(config.item.split('/').filter(filterOutParentAndEmpty))
    .map(encodeURIComponent)
    .join('/')
}

const getFileSystemPath = config => {
  throwIfBadFilepath(config)
  return getPathFromProjectRoot('node_modules',
    config.packageName,
    config.item.split('/').filter(filterOutParentAndEmpty).join(path.sep))
}

const getPublicUrlAndFileSystemPath = config => ({
  fileSystemPath: getFileSystemPath(config),
  publicUrl: getPublicUrl(config)
})

const getList = type => extensionsByType[type] || []

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

const prepareWordForPackageNameDisplay = word => {
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

const preparePackageNameForDisplay = packageName => {
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

const listInstalledExtensions = () => {
  const extensions = []
  Object.keys(extensionsByType).forEach(key => {
    extensionsByType[key].forEach(config => {
      const currentExtension = config.packageName
      if (!extensions.includes(currentExtension)) {
        extensions.push(currentExtension)
      }
    })
  })
  return extensions
}

function expandToIncludeShadowNunjucks (arr) {
  const out = []
  arr.forEach(orig => {
    out.push(orig)
    const [start, end] = orig.split('node_modules')
    out.push(path.join(start, shadowNunjucks, end))
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

// Exports
const self = module.exports = {
  preparePackageNameForDisplay,
  listInstalledExtensions,
  getByType: type => getList(type),
  getPublicUrls: type => getList(type).map(getPublicUrl),
  getFileSystemPaths: type => getList(type).map(getFileSystemPath),
  getPublicUrlAndFileSystemPaths: type => getList(type).map(getPublicUrlAndFileSystemPath),
  getAppConfig: additionalConfig => ({
    scripts: self.getPublicUrls('scripts').concat((additionalConfig || {}).scripts || []),
    stylesheets: self.getPublicUrls('stylesheets').concat((additionalConfig || {}).stylesheets || [])
  }),
  getAppViews: additionalViews => expandToIncludeShadowNunjucks(self
    .getFileSystemPaths('nunjucksPaths'))
    .reverse()
    .concat(additionalViews || []),
  legacyGovukFrontendFixesNeeded: () => {
    try {
      const config = require(path.join(projectDir, 'node_modules/govuk-frontend/govuk-prototype-kit.config.json'))
      return !config.nunjucksMacros
    } catch (e) {
      return false
    }
  },
  setExtensionsByType,
  watchPlugins
}
