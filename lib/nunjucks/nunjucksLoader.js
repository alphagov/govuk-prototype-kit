const nunjucks = require('nunjucks')
const { getConfig } = require('../config')

const NunjucksLoader = nunjucks.Loader.extend({
  init: function (appViews) {
    this.appViews = appViews || []
    this.async = false
    console.log('appViews', appViews)
  },

  getSource: function (name) {
    if (name === 'index') {
      let src = '<h1>This is the homepage</h1>'
      let pathToFile = '/the/full/path/to/the/homepage.njk'
      return {
        src,
        path: pathToFile,
        noCache: this.noCache
      }
    } else {
      throw new Error(`Template not found: ${name}`)
    }
  }
})

module.exports = NunjucksLoader
