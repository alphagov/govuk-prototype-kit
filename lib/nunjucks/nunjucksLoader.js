const nunjucks = require('nunjucks')
const config = require('../config')
const path = require('path')
const fs = require('fs')
const { projectDir } = require('../utils/paths')
const chokidar = require('chokidar')

// For information about extending the Nunjucks Loader see the following Nunjucks documentation:
// https://mozilla.github.io/nunjucks/api.html#writing-a-loader
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

  getSource: function (name) {
    let pathToFile
    const filename = name.split('/').pop()

    if (filename.includes('.') && fs.existsSync(name)) {
      pathToFile = name
    } else {
      const dirname = name.substring(0, name.lastIndexOf(filename) - 1)
      const viewExtensions = config.getConfig().useNjkExtensions ? ['njk', 'html'] : ['html', 'njk']
      // The primary view extension is the original filename extension if it exists or the first entry in the viewExtensions
      const [viewName, primaryViewExtension = viewExtensions[0]] = filename.split('.')
      // The secondary view extension is the extension remaining that is not the primary extension
      const secondaryViewExtension = viewExtensions.find(extension => extension !== primaryViewExtension)
      const extensionPriority = [primaryViewExtension, secondaryViewExtension]

      extensionPriority.some(extension => this.appViews.some(appView => {
        const currentPathToFile = path.join(appView, dirname, viewName + '.' + extension)
        if (fs.existsSync(currentPathToFile)) {
          pathToFile = currentPathToFile
        }
        return pathToFile
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
