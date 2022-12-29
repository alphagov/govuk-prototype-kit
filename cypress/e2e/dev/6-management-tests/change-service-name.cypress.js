
// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication } = require('../../utils')

const appConfigPath = path.join('app', 'config.json')

const appConfig = path.join(Cypress.env('projectFolder'), appConfigPath)
const backupAppConfig = path.join(Cypress.env('tempFolder'), 'temp-config.js')

const originalText = 'Service name goes here'
const newText = 'Cypress test'

const serverNameQuery = 'a.govuk-header__link.govuk-header__service-name, a.govuk-header__link--service-name'

const managePagePath = '/manage-prototype'

describe('change service name', () => {
  before(() => {
    waitForApplication()
    // backup config.js
    cy.task('copyFile', { source: appConfig, target: backupAppConfig })
    waitForApplication()
  })

  after(() => {
    // restore config.js
    cy.task('copyFile', { source: backupAppConfig, target: appConfig })
    cy.task('deleteFile', { filename: backupAppConfig })
  })

  it('The service name should change to "cypress test" and the task should be set to "Done"', () => {
    cy.task('log', 'Visit the index page and navigate to the manage your prototype page')
    cy.get('.govuk-heading-xl').should('contains.text', originalText)
    cy.get('p strong').should('contains.text', appConfigPath)
    cy.get(`main a[href="${managePagePath}"]`).should('contains.text', 'Manage your prototype').click()

    cy.task('log', 'Visit the manage prototype page')

    cy.get(serverNameQuery).should('contains.text', originalText)
    cy.get('.app-task-list__item')
      .eq(0).should('contains.text', appConfigPath)
      .get('.app-task-list__tag').should('contains.text', 'To do')

    cy.task('replaceTextInFile', { filename: appConfig, originalText, newText })

    waitForApplication(managePagePath)

    cy.get(serverNameQuery).should('contains.text', newText)
    cy.get('.app-task-list__item')
      .eq(0).should('contains.text', appConfigPath)
      .get('.app-task-list__tag').should('contains.text', 'Done')

    cy.visit('/index')
    cy.get('.govuk-heading-xl').should('contains.text', newText)
  })
})
