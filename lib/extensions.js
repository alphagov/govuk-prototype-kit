// Imports
const fs = require('fs')
const path = require('path')
const foundationExtensions = require('../app/config').foundationExtensions || ['govuk-frontend']

// Utils
const pathFromRoot = (...all) => path.join.apply(null, [__dirname, '..'].concat(all))
const pathToHookFile = packageName => pathFromRoot('node_modules', packageName, 'govuk-prototype-kit.config.json')
const objectMap = (object, mapFn) => Object.keys(object).reduce((result, key) => {
  result[key] = mapFn(object[key], key)
  return result
}, {})
const removeDuplicates = arr => arr.filter((i, pos, self) => self.indexOf(i) === pos)
const filterOutTreversesAndEmpty = part => part && part !== '..'
const cloneArray = arr => arr.slice(0)

// Reused Functions
const lookupConfigForPackage = packageName => {
  if (fs.existsSync(pathToHookFile(packageName))) {
    return require(pathToHookFile(packageName))
  } else {
    return {}
  }
}

const getPackageNamesInOrder = () => {
  const dependencies = require(pathFromRoot('package.json')).dependencies || {}
  const allNpmDependenciesInAlphabeticalOrder = Object.keys(dependencies).sort()
  const installedTopPriorityDependencies = foundationExtensions
    .filter(packageName => allNpmDependenciesInAlphabeticalOrder.indexOf(packageName) > -1)

  return removeDuplicates(installedTopPriorityDependencies.concat(allNpmDependenciesInAlphabeticalOrder))
}

const getSourceFromItem = item => typeof item === 'string' ? item : item.src

const extensionItemsByType = getPackageNamesInOrder()
  .reduce((accum, packageName) => Object.assign({}, accum, objectMap(
    lookupConfigForPackage(packageName),
    (item, key) => (accum[key] || []).concat(item.map(item => ({packageName, item})))
  )), {})

const publicUrl = config => config.item.global ? '/assets' : ['', 'extension-assets', config.packageName]
  .concat(config.item.split('/').filter(filterOutTreversesAndEmpty))
  .map(encodeURIComponent).join('/')

const fileSystemPath = (config) => pathFromRoot('node_modules', config.packageName, getSourceFromItem(config.item).split('/')
  .filter(filterOutTreversesAndEmpty)
  .join(path.sep))

const mappers = {
  fileSystemPath,
  publicUrl,

  publicUrlAndFileSystemPath: config => ({
    fileSystemPath: fileSystemPath(config),
    publicUrl: publicUrl(config)
  })
}

// Exports
const self = module.exports = {
  getList: (hookType) => cloneArray(extensionItemsByType[hookType] || []),

  getPublicUrls: x => self.getList(x).map(mappers.publicUrl),
  getFileSystemPaths: x => self.getList(x).map(mappers.fileSystemPath),
  getPublicUrlAndFileSystemPaths: x => self.getList(x).map(mappers.publicUrlAndFileSystemPath),

  mappers,

  getAppConfig: _ => ({
    scripts: self.getPublicUrls('scripts'),
    stylesheets: self.getPublicUrls('stylesheets')
  })
}
