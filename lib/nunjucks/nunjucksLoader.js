const nunjucks = require('nunjucks')
const { getConfig } = require('../config')
const { recursiveDirectoryContentsSync } = require('../utils')
const path = require('path')
const fs = require('fs')

const NunjucksLoader = nunjucks.Loader.extend({
  init: function (appViews) {
    this.appViews = appViews || []
    this.async = false
    console.log('appViews', appViews.map(recursiveDirectoryContentsSync))
  },

  generateFileNamesToTry: function (name) {
    const currentExtension = name.split('.').pop()
    const primaryExtension = getConfig().useNjkExtensions ? 'njk' : 'html'
    const secondaryExtension = getConfig().useNjkExtensions ? 'html' : 'njk'
    const hasExtension = currentExtension !== name && !currentExtension.includes('/')
    const result = []

    if (hasExtension) {
      result.push(name)
      if (currentExtension !== primaryExtension) {
        result.push(replaceOrAddExtension(name, primaryExtension))
      }
      if (currentExtension !== secondaryExtension) {
        result.push(replaceOrAddExtension(name, secondaryExtension))
      }
    } else {
      result.push(replaceOrAddExtension(name, primaryExtension))
      result.push(replaceOrAddExtension(name, secondaryExtension))
    }
    return result

    function replaceOrAddExtension (filePath, newExtension) {
      const pathParts = filePath.split('/')
      const lastPartIndex = pathParts.length - 1
      const lastPart = pathParts[lastPartIndex]
      const extensionPosition = lastPart.lastIndexOf('.')
      const hasExtension = extensionPosition > -1
      const lastPartWithoutExtension = hasExtension ? lastPart.substring(0, extensionPosition) : lastPart
      pathParts[lastPartIndex] = lastPartWithoutExtension + '.' + newExtension
      return pathParts.join('/')
    }
  },

  getSource: function (name) {
    const fileNamesToTry = this.generateFileNamesToTry(name)
    const absolutePathsToCheck = this.appViews.map(appViewDir => fileNamesToTry.map(x => path.join(appViewDir, x))).flat()
    let src = ''
    let pathToFile = ''

    absolutePathsToCheck.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        src = fs.readFileSync(filePath, 'utf8')
        pathToFile = filePath
      }
    })
    console.log(src)
    console.log(pathToFile)
    return {
      src,
      path: pathToFile,
      noCache: this.noCache
    }
}
})

module.exports = NunjucksLoader