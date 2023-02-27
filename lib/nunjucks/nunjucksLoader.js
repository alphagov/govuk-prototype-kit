const nunjucks = require('nunjucks')
const { getConfig } = require('../config')
const { recursiveDirectoryContentsSync } = require('../utils')
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const chokidarInstances = []

function withExtension (file, extension) {
  const pathParts = file.split('/')
  const fileName = pathParts[pathParts.length - 1]
  const fileNameParts = fileName.split('.')
  const fileExtensionOrFileName = fileNameParts[fileNameParts.length - 1]
  const hasFileExtension = fileExtensionOrFileName !== fileName
  const fileNameWithoutExtension = hasFileExtension ? file.substring(0, file.lastIndexOf('.')) : file

  return `${fileNameWithoutExtension}.${extension}`
}

const NunjucksLoader = nunjucks.Loader.extend({
  isNunjucksFile: function (filename) {
    return filename.endsWith(`.${this.primaryExtension}`) || filename.endsWith(`.${this.secondaryExtension}`)
  },
  init: function (appViews) {
    const config = getConfig()
    this.appViews = appViews || []
    this.async = false
    this.primaryExtension = config.useNjkExtensions ? 'njk' : 'html'
    this.secondaryExtension = config.useNjkExtensions ? 'html' : 'njk'
    this.noCache = config.isDevelopment
    this.files = {}

    const addToFiles = fileInfo => {
      const fileInfoWithContents = {
        ...fileInfo,
        fileContents: '<h1>Hello world</h1>'//fs.readFileSync(fileInfo.absolutePath, 'utf8')
      }
      this.files[fileInfo.absolutePath] = fileInfoWithContents
      if (!this.files[fileInfo.relativePath] ||
        (fileInfo.appViewDirIndex !== undefined && this.files[fileInfo.relativePath].appViewDirIndex > fileInfo.appViewDirIndex)) {
        this.files[fileInfo.relativePath] = fileInfoWithContents
      }
    }

    appViews.map((appViewDir, appViewDirIndex) => recursiveDirectoryContentsSync(appViewDir)
      .filter(filename => this.isNunjucksFile(filename))
      .map(file => ({
        absolutePath: path.join(appViewDir, file),
        relativePath: file,
        appViewDir,
        appViewDirIndex
      }))).flat()
      .forEach(addToFiles)

    const emit = (path) => {
      this.emit('update', path)
      console.log('emitting', path)
    }

    const update = filePath => {
      const fileInfo = this.files[filePath]
      if (!fileInfo) {
        add(filePath)
      }
      fileInfo.fileContents = fs.readFileSync(filePath, 'utf8')
      emit(filePath)
      emit(fileInfo.relativePath)
    }

    const add = filePath => {
      this.appViews.map((appViewDir, appViewDirIndex) => {
        if (filePath.startsWith(appViewDir)) {
          return {
            relativePath: filePath.substring(appViewDir.length),
            appViewDir,
            appViewDirIndex
          }
        }
      })
        .filter(fileInfo => !!fileInfo)
        .forEach(fileInfo => {
          addToFiles({
            ...fileInfo,
            absolutePath: filePath
          })
          emit(filePath)
          emit(fileInfo.relativePath)
        })
    }

    const remove = filePath => {
      Object.keys(this.files)
        .filter(key => this.files[key].absolutePath === filePath)
        .forEach(key => {
          delete this.files[key]
          emit(key)
        })
    }

    chokidarInstances.push(chokidar.watch(appViews[0], {
      ignoreInitial: true,
      disableGlobbing: true // Prevents square brackets from being mistaken for globbing characters
    })
      .on('add', (filePath) => {
        if (!this.isNunjucksFile(filePath)) return
        add(filePath)
      })
      .on('unlink', (filePath) => {
        if (!this.isNunjucksFile(filePath)) return
        remove(filePath)
      })
      .on('change', (filePath) => {
        if (!this.isNunjucksFile(filePath)) return
        update(filePath)
      }))
  },

  getSource: function (name) {
    const fileNamesToLookFor = [
      name,
      withExtension(name, this.primaryExtension),
      withExtension(name, this.secondaryExtension)
    ]
    const found = fileNamesToLookFor.find(name => this.files[name])
    if (found) {
      const fileInfo = this.files[found]
      return {
        src: fileInfo.fileContents,
        path: fileInfo.absolutePath,
        noCache: this.noCache
      }
    }
    const error = new Error(`template not found: ${name}`)
    throw error
  },

})

module.exports = {
  NunjucksLoader,
  stopWatchingNunjucks: () => {
    chokidarInstances.forEach(x => x.close())
  }
}
