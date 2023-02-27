const nunjucks = require('nunjucks')
const { getConfig } = require('../config')
const { recursiveDirectoryContentsSync } = require('../utils')
const { projectDir } = require('../utils/paths')
const fs = require('fs')
const path = require('path')

const NunjucksLoader = nunjucks.Loader.extend({
  init: function (appViews) {
    this.appViews = appViews || []
    this.async = false
    this.viewExtensions = getConfig().useNjkExtensions ? ['njk', 'html'] : ['html', 'njk']
    console.log('appViews', appViews.map(recursiveDirectoryContentsSync))
  },

  getSource: function (name) {
    let pathToFile

    if (name.startsWith(projectDir) && fs.existsSync(name)) {
      pathToFile = name
    } else {
      const filename = name.split(path.sep).pop()
      const dirname = name.substring(0, name.lastIndexOf(filename) - 1)
      const [viewName, viewExtension = this.viewExtensions[0]] = filename.split('.')
      const extensionPriority = [viewExtension, this.viewExtensions.find(extension => extension !== viewExtension)]

      extensionPriority.find(extension => this.appViews.find(appView => {
        const currentPathToFile = path.join(appView, dirname, viewName + '.' + extension)
        if (fs.existsSync(currentPathToFile)) {
          pathToFile = currentPathToFile
          return true
        }
      }))
    }

    if (!pathToFile) {
      throw new Error(`template not found: ${name}`)
    }

    return {
      src: fs.readFileSync(pathToFile, 'utf8'),
      path: pathToFile,
      noCache: this.noCache
    }
  }
})

module.exports = NunjucksLoader
