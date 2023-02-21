const path = require('path')
const nunjucks = require('nunjucks')
const fse = require('fs-extra')
const fsp = require('fs').promises
const { appViewsDir } = require('../utils/paths')
const { getConfig } = require('../config')

const NunjucksLoader = nunjucks.Loader.extend({
  init: function (appViews) {
    this.appViews = appViews || []
    this.async = true
    console.log(appViews)
    // setup a process which watches templates here
    // and call `this.emit('update', name)` when a template
    // is changed
  },

  generateFileNamesToTry: function (name) {
    const currentExtension = name.split('.').pop()
    const primaryExtension = getConfig().useNjkExtensions ? 'njk' : 'html'
    const secondaryExtension = getConfig().useNjkExtensions ? 'html' : 'njk'
    const hasExtension = currentExtension !== name && !currentExtension.includes('/')
    const result = []

    console.table({ name, currentExtension, primaryExtension, secondaryExtension })

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

  getSource: function (name, callback) {
    console.log(this)
    const filePathsToTry = this.generateFileNamesToTry(name)
    const absolutePathsToTry = []
    if (name.startsWith('/') || name.substring(1, 3) === ':/') {
      absolutePathsToTry.push(name)
    }
    absolutePathsToTry.concat(...this.appViews.map(appViewDir => filePathsToTry.map(x => path.join(appViewDir, x))).flat())
    Promise.all(absolutePathsToTry.map(pathToTry => fse.exists(pathToTry).then(exists => ({
      absolutePath: pathToTry,
      exists
    }))))
      .then(results => {
        console.log(results)
        const firstResultThatExists = results.find(x => x.exists)
        if (!firstResultThatExists) {
          return callback(new Error('Template not found.'))
        }
        const pathToFile = firstResultThatExists.absolutePath
        console.log(pathToFile)
        return fsp.readFile(pathToFile, 'utf8').then(src => {
          callback(null, {
            src,
            path: pathToFile,
            noCache: this.noCache
          })
        })
      })
  }
})

function getNunjucksAppEnv (appViews) {
  return new nunjucks.Environment(new NunjucksLoader(appViews))
}

function expressNunjucks (env, app) {
  function NunjucksView (name, opts) {
    this.name = name
    this.path = name
    this.defaultEngine = opts.defaultEngine
    this.ext = path.extname(name)
    if (!this.ext && !this.defaultEngine) {
      throw new Error('No default engine was specified and no extension was provided.')
    }
  }

  NunjucksView.prototype.render = function render (opts, cb) {
    env.render(this.name, opts, cb)
  }

  app.set('view', NunjucksView)
  app.set('nunjucksEnv', env)
  return env
}

module.exports = { NunjucksLoader, getNunjucksAppEnv, expressNunjucks }
