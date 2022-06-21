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
const appConfig = require('../../app/config')
const { projectDir } = require('../path-utils')

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

const readJsonFile = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}
const getPackageConfig = packageName => {
  if (fs.existsSync(pathToPackageConfigFile(packageName))) {
    return readJsonFile(pathToPackageConfigFile(packageName))
  } else {
    return {}
  }
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
const getBaseExtensions = () => appConfig.baseExtensions || ['govuk-frontend']

// Get all npm dependencies
// Get baseExtensions in the order defined in `baseExtensions` in config.js
// Then place baseExtensions before npm dependencies (and remove duplicates)
const getPackageNamesInOrder = () => {
  const dependencies = readJsonFile(getPathFromProjectRoot('package.json')).dependencies || {}
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

// The hard-coded reference to govuk-frontend allows us to soft launch without a breaking change.  After a hard launch
// govuk-frontend assets will be served on /extension-assets/govuk-frontend
const getPublicUrl = config => {
  if (config.item.endsWith('assets') && config.packageName === 'govuk-frontend') {
    return '/govuk/assets'
  } else {
    return ['', 'extension-assets', config.packageName]
      .concat(config.item.split('/').filter(filterOutParentAndEmpty))
      .map(encodeURIComponent)
      .join('/')
  }
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

// Exports
const self = module.exports = {
  getPublicUrls: type => getList(type).map(getPublicUrl),
  getFileSystemPaths: type => getList(type).map(getFileSystemPath),
  getPublicUrlAndFileSystemPaths: type => getList(type).map(getPublicUrlAndFileSystemPath),
  getAppConfig: _ => ({
    scripts: self.getPublicUrls('scripts'),
    stylesheets: self.getPublicUrls('stylesheets')
  }),
  getAppViews: additionalViews => self
    .getFileSystemPaths('nunjucksPaths')
    .reverse()
    .concat(additionalViews || []),

  setExtensionsByType // exposed only for testing purposes
}
