const path = require('path')

const { waitForApplication } = require('../utils')

const appConfig = path.join(Cypress.env('projectFolder'), 'app', 'config.js')
const backupAppConfig = path.join(Cypress.env('tempFolder'), 'temp-config.js')

const originalText = 'Service name goes here'
const newText = 'Cypress test'

const serverNameQuery = 'a.govuk-header__link.govuk-header__service-name, a.govuk-header__link--service-name'

describe('watch config file', () => {
  describe(`service name in config file ${appConfig} should be changed and restored`, () => {
    before(() => {
      waitForApplication()
      // backup config.js
      cy.task('copyFile', { source: appConfig, target: backupAppConfig })
    })

    after(() => {
      // restore config.js
      cy.task('copyFile', { source: backupAppConfig, target: appConfig })
      cy.task('deleteFile', { filename: backupAppConfig })
    })

    it('The service name should change to "cypress test"', () => {
      cy.get(serverNameQuery).should('contains.text', originalText)
      cy.task('replaceTextInFile', { filename: appConfig, originalText, newText })
      waitForApplication()
      cy.get(serverNameQuery).should('contains.text', newText)
    })
  })
})
