const nunjucks = require('nunjucks')
const { getConfig } = require('../config')
const { recursiveDirectoryContentsSync } = require('../utils')

const NunjucksLoader = nunjucks.Loader.extend({
  init: function (appViews) {
    this.appViews = appViews || []
    this.async = false
    console.log('appViews', appViews.map(recursiveDirectoryContentsSync))
  },

  getSource: function (name) {
    let src
    let pathToFile
    if (name === 'index') {
      src = '<h1>This is the homepage</h1>'
      pathToFile = '/the/full/path/to/the/homepage.njk'
    } else if (name === 'my-page') {
      src = '<h1>This is my page</h1>'
      pathToFile = '/the/full/path/to/my-page.njk'
    } else {
      throw new Error(`Template not found: ${name}`)
    }
    return {
      src,
      path: pathToFile,
      noCache: this.noCache
    }
}
})

module.exports = NunjucksLoader
