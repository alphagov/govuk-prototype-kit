const { defineConfig } = require('cypress')
const plugins = require('./cypress/plugins')

module.exports = defineConfig({
  video: false,
  chromeWebSecurity: false,
  trashAssetsBeforeRun: true,
  e2e: {
    setupNodeEvents(on, config) {
      return plugins(on, config)
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cypress.js'
  }
})
