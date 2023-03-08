const nunjucks = require('nunjucks')
const { getConfig } = require('../config')
const { recursiveDirectoryContentsSync } = require('../utils')
const path = require('path')
const fs = require('fs')
const { projectDir } = require('../utils/paths')
const chokidar = require('chokidar')

const NunjucksLoader = nunjucks.Loader.extend({
  init: function (appViews) {
    this.appViews = appViews || []
    this.async = false
    this.noCache = true
    const viewDir = path.join(projectDir, 'app', 'views')

    const updateHandler = (path) => {
      if (path.startsWith(viewDir)) {
        this.emit('update', path.substring(viewDir.length + 1))
      }
    }

    chokidar.watch(viewDir, {
      ignoreInitial: true,
      disableGlobbing: true // Prevents square brackets from being mistaken for globbing characters
    })
      .on('add', updateHandler)
      .on('change', updateHandler)
      .on('unlink', updateHandler)
  },

  generateFileNamesToTry: function (name) {
    // Find last slash index to avoid issues with user paths with dot in username (e.g. bob.dylan)
    const slashIndex = name.lastIndexOf('/')
    let sourceFileName = ''
    let pathPrefix = ''

    if (slashIndex > 0) {
      // Store path prefix
      pathPrefix = name.substring(0, slashIndex + 1)
      sourceFileName = name.substring(slashIndex + 1)
    } else {
      sourceFileName = name
    }

    const [fileName, currentExtension] = sourceFileName.split('.')
    const [primaryExtension, secondaryExtension] = getConfig().useNjkExtensions ? ['njk', 'html'] : ['html', 'njk']
    const result = []

    if (currentExtension) {
      result.push(name)
      if (currentExtension !== primaryExtension) {
        result.push(pathPrefix + fileName + '.' + primaryExtension)
      }
      if (currentExtension !== secondaryExtension) {
        result.push(pathPrefix + fileName + '.' + secondaryExtension)
      }
    } else {
      result.push(pathPrefix + fileName + '.' + primaryExtension)
      result.push(pathPrefix + fileName + '.' + secondaryExtension)
    }

    return result
  },

  getSource: function (name) {
    const fileNamesToTry = this.generateFileNamesToTry(name)

    const absolutePathsToCheck = this.appViews.map(appViewDir => fileNamesToTry.map(x => path.join(appViewDir, x))).flat()
    const existingPaths = []

    let src = ''
    let pathToFile = ''

    if (name.startsWith('/') || name.substring(1, 3) === ':/') {
      absolutePathsToCheck.push(name)
    }

    fileNamesToTry.forEach(fileName => {
      absolutePathsToCheck.forEach(absolutePath => {
        if (absolutePath.includes(fileName)) {
          if (fs.existsSync(absolutePath)) {
            existingPaths.push(absolutePath)
          }
        }
      })
    })

    if (existingPaths.length > 0) {
      src = fs.readFileSync(existingPaths[0], 'utf8')
      pathToFile = existingPaths[0]
    } else {
      src = 'Page not found: ' + name
      pathToFile = '/not-found'
    }

    return {
      src,
      path: pathToFile,
      noCache: this.noCache
    }
  }
})

module.exports = NunjucksLoader
