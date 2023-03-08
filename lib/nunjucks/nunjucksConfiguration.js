const path = require('path')
const nunjucks = require('nunjucks')
const fse = require('fs-extra')
const fsp = require('fs').promises
const { appViewsDir } = require('../utils/paths')
const { getConfig } = require('../config')
const chokidar = require('chokidar')
const NunjucksLoader = require('./nunjucksLoader')

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
