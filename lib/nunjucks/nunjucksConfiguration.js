const path = require('path')
const { Environment } = require('nunjucks')
const NunjucksLoader = require('./nunjucksLoader')
const { stopWatchingNunjucks } = NunjucksLoader
const { startPerformanceTimer, endPerformanceTimer } = require('../utils/performance')

/**
 * Create Nunjucks environment
 *
 * Provide an optional GOV.UK Frontend paths object to append
 * backup view directories if the plugin version is uninstalled
 *
 * @param {string[]} appViews
 * @param {GOVUKFrontendPaths} [govukFrontend]
 * @returns {import('nunjucks').Environment}
 */
function getNunjucksAppEnv (appViews, govukFrontend) {
  const nunjucksViews = [...appViews]

  if (govukFrontend) {
    const { baseDir, config } = govukFrontend

    // Combine with backup GOV.UK Frontend views
    nunjucksViews.push(...[config.nunjucksPaths].flat()
      .map(nunjucksPath => path.join(baseDir, nunjucksPath))
    )
  }

  return new Environment(new NunjucksLoader(nunjucksViews))
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
    const timer = startPerformanceTimer()
    env.render(this.name, opts, function () {
      cb.apply(null, arguments)
      endPerformanceTimer('NunjucksView.render', timer)
    })
  }

  app.set('view', NunjucksView)
  app.set('nunjucksEnv', env)
  return env
}

module.exports = { NunjucksLoader, getNunjucksAppEnv, expressNunjucks, stopWatchingNunjucks }

/**
 * @typedef {import('../govukFrontendPaths').GOVUKFrontendPaths} GOVUKFrontendPaths
 */
