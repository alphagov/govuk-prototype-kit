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
    const [fileName, currentExtension] = name.split('.')
    const [primaryExtension, secondaryExtension] = getConfig().useNjkExtensions ? ['njk', 'html'] : ['html', 'njk']

    const result = []

    if (currentExtension) {
      result.push(name)
      if (currentExtension !== primaryExtension) {
        result.push(fileName + '.' + primaryExtension)
      }
      if (currentExtension !== secondaryExtension) {
        result.push(fileName + '.' + secondaryExtension)
      }
    } else {
      result.push(fileName + '.' + primaryExtension)
      result.push(fileName + '.' + secondaryExtension)
    }

    return result
  },

  getSource: function (name) {
    const fileNamesToTry = this.generateFileNamesToTry(name)
    const absolutePathsToCheck = this.appViews.map(appViewDir => fileNamesToTry.map(x => path.join(appViewDir, x))).flat()
    let existingPaths = []

    let src = ''
    let pathToFile = ''

    if (name.startsWith('/') || name.substring(1, 3) === ':/') {
      absolutePathsToCheck.push(name)
    }

    fileNamesToTry.forEach(fileName => {
      absolutePathsToCheck.forEach(absolutePath => {
        
        if (absolutePath.includes(fileName)) {
          if (fs.existsSync(absolutePath)){
            existingPaths.push(absolutePath)
          }
        }
      })
    })

    if (existingPaths) {
      src = fs.readFileSync(existingPaths[0], 'utf8')
      pathToFile = existingPaths[0]
    } 

    return {
      src,
      path: pathToFile,
      noCache: this.noCache
    }
  }
})

module.exports = NunjucksLoader