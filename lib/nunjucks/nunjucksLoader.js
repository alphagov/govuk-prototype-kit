const nunjucks = require('nunjucks')
const config = require('../config')
const { recursiveDirectoryContentsSync } = require('../utils')
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const plugins = require('../plugins/plugins')
const { startPerformanceTimer, endPerformanceTimer } = require('../utils/performance')
const chokidarInstances = []

function withExtension (file, extension) {
  const pathParts = file.split(path.sep)
  const fileName = pathParts[pathParts.length - 1]
  const fileNameParts = fileName.split('.')
  const fileExtensionOrFileName = fileNameParts[fileNameParts.length - 1]
  const hasFileExtension = fileExtensionOrFileName !== fileName
  const fileNameWithoutExtension = hasFileExtension ? file.substring(0, file.lastIndexOf('.')) : file

  return `${fileNameWithoutExtension}.${extension}`
}

const replaceWindowsBackslashPaths = path.sep === '/' ? (input) => { return input } : input => input.replaceAll(path.sep, '/')

const NunjucksLoader = nunjucks.Loader.extend({
  isNunjucksFile: function (filename) {
    return filename.endsWith(`.${this.primaryExtension}`) || filename.endsWith(`.${this.secondaryExtension}`)
  },
  sortByPriority: ({ appViewDirIndex: l }, { appViewDirIndex: r }) => l === r ? 0 : l > r ? 1 : -1,
  getFileContents: function (absolutePath) {
    const fileContents = fs.readFileSync(absolutePath, 'utf8')
    if (this.importNunjucksMacrosInto.includes(absolutePath)) {
      return fileContents + this.nunjucksMacrosIncludeString
    }
    return fileContents
  },
  init: function (appViews) {
    const timer = startPerformanceTimer()
    const userConfig = config.getConfig()
    this.appViews = (appViews || []).map(appView => {
      let viewPath = appView
      while (viewPath.endsWith(path.sep)) {
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

    const addToFiles = (fileInfo, readImmediately = false) => {
      const fileInfoClone = {
        ...fileInfo
      }
      if (readImmediately) {
        fileInfoClone.fileContents = this.getFileContents(fileInfo.absolutePath)
      }
      this.files[fileInfo.absolutePath] = fileInfoClone
      if (!this.files[fileInfo.relativePath] ||
        (fileInfo.appViewDirIndex !== undefined && this.files[fileInfo.relativePath].appViewDirIndex > fileInfo.appViewDirIndex)) {
        this.files[fileInfo.relativePath] = fileInfoClone
      }
    }

    appViews.map((appViewDir, appViewDirIndex) => recursiveDirectoryContentsSync(appViewDir)
      .filter(filename => this.isNunjucksFile(filename))
      .map(file => ({
        absolutePath: path.join(appViewDir, file),
        relativePath: replaceWindowsBackslashPaths(file),
        appViewDir,
        appViewDirIndex
      }))).flat()
      .forEach(addToFiles)

    const emit = (path) => {
      this.emit('update', path)
    }

    const update = filePath => {
      const timer = startPerformanceTimer()
      const fileInfo = this.files[filePath]
      if (!fileInfo) {
        add(filePath)
      }
      fileInfo.fileContents = this.getFileContents(filePath)
      emit(filePath)
      emit(fileInfo.relativePath)
      endPerformanceTimer('NunjucksLoader update', timer)
    }

    const add = filePath => {
      const timer = startPerformanceTimer()
      this.appViews.map((appViewDir, appViewDirIndex) => filePath.startsWith(appViewDir) && {
        relativePath: replaceWindowsBackslashPaths(filePath.substring(appViewDir.length + 1)),
        appViewDir,
        appViewDirIndex
      })
        .filter(fileInfo => !!fileInfo)
        .forEach(fileInfo => {
          addToFiles({
            ...fileInfo,
            absolutePath: filePath
          }, true)
          emit(filePath)
          emit(fileInfo.relativePath)
        })
      endPerformanceTimer('NunjucksLoader add', timer)
    }

    const remove = filePath => {
      const timer = startPerformanceTimer()
      Object.keys(this.files)
        .filter(key => this.files[key].absolutePath === filePath)
        .map(key => ({
          key,
          suitableReplacementKey: Object.keys(this.files)
            .filter(filterKey => this.files[filterKey].relativePath === key && this.files[filterKey].absolutePath !== filePath)
            .sort(this.sortByPriority)
            .at(0)
        }))
        .forEach(({ key, suitableReplacementKey }) => {
          if (suitableReplacementKey) {
            this.files[key] = this.files[suitableReplacementKey]
          } else {
            delete this.files[key]
          }
          emit(key)
        })
      endPerformanceTimer('NunjucksLoader remove', timer)
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
    const fileNamesToLookFor = [name]

    if (path.sep === '\\') {
      fileNamesToLookFor.push(replaceWindowsBackslashPaths(name))
    }

    fileNamesToLookFor.push(withExtension(name, this.primaryExtension))
    fileNamesToLookFor.push(withExtension(name, this.secondaryExtension))

    const fileInfo = fileNamesToLookFor.map(name => this.files[name]).sort(this.sortByPriority)[0]
    if (fileInfo) {
      if (!fileInfo.fileContents) {
        fileInfo.fileContents = this.getFileContents(fileInfo.absolutePath)
      }
      const result = {
        src: fileInfo.fileContents,
        path: fileInfo.absolutePath,
        noCache: this.noCache
      }
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
