const fs = require('fs')
const path = require('path')

const pathJoinFromRoot = (...all) => path.join.apply(null, [__dirname, '..'].concat(all))

const pathToHookFile = packageName => pathJoinFromRoot('node_modules', packageName, 'govuk-prototype-kit-hooks.json')

const flatten = x => [].concat(...x)
const noEditFn = x => x

const defaultConfigs = {
  'govuk-frontend': {
    nunjucksDirs: ['/', 'components'],
    scripts: ['/all.js'],
    globalAssets: ['/assets'],
    sassIncludes: ['/all.scss']
  }
}

const packageConfig = require(pathJoinFromRoot('package.json'))

const lookupConfig = packageName => hookFileExists(packageName) ? require(pathToHookFile(packageName)) : defaultConfigs[packageName]

const hookFileExists = packageName => fs.existsSync(pathToHookFile(packageName)) && fs.statSync(pathToHookFile(packageName)).isFile()

const alphabeticSort = (l, r) => (l < r) ? -1 : ((l > r) ? 1 : 0)

const sortFrameworksBeforeOtherPlugins = (l, r) => {
  const priorities = (packageConfig.govukPluginFrameworks || []);
  const rightIndex = priorities.indexOf(r)
  const leftIndex = priorities.indexOf(l)
  const rightIsPriority = rightIndex !== -1
  const leftIsPriority = leftIndex !== -1

  if (rightIsPriority && leftIsPriority) {
    return leftIndex > rightIndex
  }
  if (leftIsPriority && !rightIsPriority) {
    return -1
  }
  if (!leftIsPriority && rightIsPriority) {
    return 1
  }
  return alphabeticSort(l, r)
}

const getList = (hookType, editFn = noEditFn) => flatten(
  Object.keys(packageConfig.dependencies || {})
    .filter(packageName => (hookFileExists(packageName)) || defaultConfigs.hasOwnProperty(packageName))
    .sort(sortFrameworksBeforeOtherPlugins)
    .map(packageName => editFn(lookupConfig(packageName)[hookType] || [], packageName))
)

const generateServersideAndAssetPaths = generatePublicPath => (itemsInPackage, packageName) => itemsInPackage
  .map(item => ({
    filesystemPath: scopeFilePathToModule(item, packageName),
    publicPath: generatePublicPath(item, packageName)
  }))

const addLeadingSlash = item => item.startsWith('/') ? item : `/${item}`

const publicPathGenerator = (item, packageName) => ['', 'plugin-assets', packageName].map(encodeURIComponent)
  .join('/') + addLeadingSlash(item)

const scopeFilePathToModule = (item, packageName) => pathJoinFromRoot('node_modules', packageName, item)

const iterateItems = processor => (items, packageName) => items.map(item => processor(item, packageName))

const transform = {
  scopeFilePathsToModule: iterateItems(scopeFilePathToModule),
  publicAssetPaths: iterateItems(publicPathGenerator),

  filesystemPathAndPublicAssetPaths: generateServersideAndAssetPaths(publicPathGenerator),
  filesystemPathAndGlobalAssetPaths: generateServersideAndAssetPaths(_ => '/assets')
}

module.exports = {
  getList,
  transform
}
