
// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication } = require('../../utils')

const appConfigPath = path.join('app', 'config.json')
const appConfig = path.join(Cypress.env('projectFolder'), appConfigPath)

const originalText = 'Service name goes here'
const newText = 'Cypress test'

const serverNameQuery = 'h1.govuk-heading-xl'

function restore () {
  // Restore config.json from prototype starter
  cy.task('copyFromStarterFiles', { filename: appConfigPath })
}

describe('watch config file', () => {
  describe(`service name in config file ${appConfig} should be changed and restored`, () => {
    before(restore)
    after(restore)

    it('The service name should change to "cypress test"', () => {
      waitForApplication('/')
      cy.get(serverNameQuery).contains(originalText)
      cy.task('replaceTextInFile', { filename: appConfig, originalText, newText })
      waitForApplication('/')
      cy.get(serverNameQuery).contains(newText)
    })
  })
})
