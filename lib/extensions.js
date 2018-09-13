const fs = require('fs')
const path = require('path')
const additionalExtensionConfigs = require('../app/config').additionalExtensionConfigs
const topPriorityExtensions = require('../app/config').topPriorityExtensions || []

const pathJoinFromRoot = (...all) => path.join.apply(null, [__dirname, '..'].concat(all))
const pathToHookFile = packageName => pathJoinFromRoot('node_modules', packageName, 'govuk-prototype-kit.config.json')
const removeDuplicates = arr => arr.filter((i, pos, self) => self.indexOf(i) === pos)
const filterOutTreversesAndEmpty = part => part && part !== '..'
const cloneArray = arr => arr.slice(0)

function objectMap(object, mapFn) {
  return Object.keys(object).reduce(function (result, key) {
    result[key] = mapFn(object[key], key)
    return result
  }, {})
}

const lookupConfigForPackage = packageName => {
  if (fs.existsSync(pathToHookFile(packageName))) {
    return require(pathToHookFile(packageName))
  } else {
    return additionalExtensionConfigs[packageName] || {}
  }
}

function getPackageNamesInOrder() {
  const dependencies = require(pathJoinFromRoot('package.json')).dependencies || {};
  const allNpmDependenciesInAlphabeticalOrder = Object.keys(dependencies).sort();
  const installedTopPriorityDependencies = topPriorityExtensions.filter(packageName => allNpmDependenciesInAlphabeticalOrder.indexOf(packageName) > -1)

  return removeDuplicates(installedTopPriorityDependencies.concat(allNpmDependenciesInAlphabeticalOrder));
}

const extensionItemsByType = getPackageNamesInOrder()
  .reduce((accum, packageName) => Object.assign({}, accum, objectMap(
    lookupConfigForPackage(packageName),
    (item, key) => (accum[key] || []).concat(item.map(item => ({packageName, item})))
  )), {})

const generatePublicAndPrivateMapper = generatePublicPath => config => ({
  filesystemPath: fileSystemPath(config),
  publicUrl: generatePublicPath(config)
})

const publicUrl = config => ['', 'plugin-assets', config.packageName]
  .concat(config.item.split('/').filter(filterOutTreversesAndEmpty))
  .map(encodeURIComponent).join('/')

const fileSystemPath = (config) => pathJoinFromRoot('node_modules', config.packageName, config.item.split('/')
  .filter(filterOutTreversesAndEmpty)
  .join(path.sep))

module.exports = {
  getList: (hookType) => cloneArray(extensionItemsByType[hookType] || []),

  mappers: {
    fileSystemPath,
    publicUrl,

    publicUrlAndFileSystemPath: generatePublicAndPrivateMapper(publicUrl),
    globalAssetUrlAndFileSystemPath: generatePublicAndPrivateMapper(_ => '/assets')
  }
}
