const path = require('path')

// npm dependencies
const { defineConfig } = require('cypress')
const setupNodeEvents = require('./cypress/events')

module.exports = defineConfig({
  video: false,
  chromeWebSecurity: false,
  trashAssetsBeforeRun: true,
  e2e: {
    setupNodeEvents,
    pathSeparator: path.sep,
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cypress.js'
  }
})
