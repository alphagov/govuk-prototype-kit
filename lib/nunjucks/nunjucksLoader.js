const nunjucks = require('nunjucks')
const config = require('../config')
const { recursiveDirectoryContentsSync } = require('../utils')
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const plugins = require('../plugins/plugins')
const {startPerformanceTimer, endPerformanceTimer} = require("../utils/performance");
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
  performanceArr: [],
  performanceEndOfInit: [],
  init: function (appViews) {
    const timer = startPerformanceTimer()
    const userConfig = config.getConfig()
    this.appViews = (appViews || []).map(appView => {
      let viewPath = appView
      while (viewPath.endsWith('/')) {
        viewPath = viewPath.substring(0, viewPath.length - 1)
      }
      return viewPath
    })
    this.async = false
    this.primaryExtension = userConfig.useNjkExtensions ? 'njk' : 'html'
    this.secondaryExtension = userConfig.useNjkExtensions ? 'html' : 'njk'
    this.noCache = !!userConfig.isDevelopment
    this.files = {}
    this.importNunjucksMacrosInto = plugins.getFileSystemPaths('importNunjucksMacrosInto')
    this.nunjucksMacrosIncludeString = plugins.getByType('nunjucksMacros').map(({
      item: {
        macroName,
        importFrom
      }
    }) => `{% from "${importFrom}" import ${macroName} %}`).join('\n')

    const getFileContents = (absolutePath) => {
      const fileContents = fs.readFileSync(absolutePath, 'utf8')
      if (this.importNunjucksMacrosInto.includes(absolutePath)) {
        return fileContents + this.nunjucksMacrosIncludeString
      }
      return fileContents
    }

    const addToFiles = fileInfo => {
      const fileInfoWithContents = {
        ...fileInfo,
        fileContents: getFileContents(fileInfo.absolutePath)
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
    }

    const update = filePath => {
      const fileInfo = this.files[filePath]
      if (!fileInfo) {
        add(filePath)
      }
      fileInfo.fileContents = getFileContents(filePath)
      emit(filePath)
      emit(fileInfo.relativePath)
    }

    const add = filePath => {
      this.appViews.map((appViewDir, appViewDirIndex) => filePath.startsWith(appViewDir) && {
        relativePath: filePath.substring(appViewDir.length + 1),
        appViewDir,
        appViewDirIndex
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
        .map(key => ({
          key,
          suitableReplacementKey: Object.keys(this.files)
            .filter(filterKey => this.files[filterKey].relativePath === key && this.files[filterKey].absolutePath !== filePath)
            .sort((l, r) => l.appViewsDirIndex > r.appViewsDirIndex ? 1 : -1)
            .at(0)
        }))
        .forEach(({ key, suitableReplacementKey }) => {
          if (suitableReplacementKey) {
            console.log('replacing [%s] with [%s]', this.files[key].absolutePath, this.files[suitableReplacementKey].absolutePath)
            this.files[key] = this.files[suitableReplacementKey]
          } else {
            console.log('removing [%s]', this.files[key].absolutePath)
            delete this.files[key]
          }
          emit(key)
        })
    }

    if (userConfig.isDevelopment) {
      chokidarInstances.push(chokidar.watch(appViews[0], {
        ignoreInitial: true,
        disableGlobbing: true // Prevents square brackets from being mistaken for globbing characters
      })
        .on('add', (filePath) => {
          if (this.isNunjucksFile(filePath)) {
            add(filePath)
          }
        })
        .on('unlink', (filePath) => {
          if (this.isNunjucksFile(filePath)) {
            remove(filePath)
          }
        })
        .on('change', (filePath) => {
          if (this.isNunjucksFile(filePath)) {
            update(filePath)
          }
        }))
    }
    endPerformanceTimer('NunjucksLoader.init', timer)
  },

  getSource: function (name) {
    const timer = startPerformanceTimer()
    const fileNamesToLookFor = [
      name,
      withExtension(name, this.primaryExtension),
      withExtension(name, this.secondaryExtension)
    ]
    if (name.startsWith('/')) {
      fileNamesToLookFor.unshift(name)
    }
    const found = fileNamesToLookFor.find(name => this.files[name])
    if (found) {
      const fileInfo = this.files[found]
      const result = {
        src: fileInfo.fileContents,
        path: fileInfo.absolutePath,
        noCache: this.noCache
      }
      // if (name.includes('layouts/main')) {
      //   result.fileExists = fs.existsSync(result.path)
      //   console.log(result)
      // }
      endPerformanceTimer('getSource (success)', timer)
      return result
    }

    endPerformanceTimer('getSource (failure)', timer)
    throw new Error(`template not found: ${name}`)
  }

})

module.exports = {
  NunjucksLoader,
  stopWatchingNunjucks: () => {
    chokidarInstances.forEach(x => x.close())
  }
}
