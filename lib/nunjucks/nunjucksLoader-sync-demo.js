const path = require('path')
const nunjucks = require('nunjucks')
const fse = require('fs-extra')
const fsp = require('fs').promises
const { appViewsDir } = require('../utils/paths')
const { getConfig } = require('../config')
const chokidar = require('chokidar')

const NunjucksLoader = nunjucks.Loader.extend({
  init: function (appViews) {
    this.appViews = appViews || []
    this.async = false
    console.log(appViews)
    const mainViews = appViews[0]

    if (fse.existsSync(mainViews)) {
      chokidar.watch(mainViews, {
        ignoreInitial: true,
        disableGlobbing: true // Prevents square brackets from being mistaken for globbing characters
      }).on('all', (type, name) => {
        const njkName = name.substring(mainViews.length)
        this.emit('update', njkName)
      })
    }
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
    console.log("name: " + name)
    
    let src = '<h1>Hello world</h1>'
    let pathToFile = '/this/is/the/full/path'

    if (name === 'index') {
      src = '<h1>Index page</h1>'
      pathToFile = '/this/is/the/index/page'
    }

    if (name === 'pages/my-page') {
      src = '<h1>This is my page</h1>'
      pathToFile = '/this/is/the/m/page'
    }

    return {
            src,
            path: pathToFile,
            noCache: this.noCache
          }
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
