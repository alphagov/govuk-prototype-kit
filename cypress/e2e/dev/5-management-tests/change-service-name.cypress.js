// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, restoreStarterFiles } = require('../../utils')

const appConfigPath = path.join('app', 'config.json')
const appConfig = path.join(Cypress.env('projectFolder'), appConfigPath)

const originalText = 'Service name goes here'
const newText = 'Cypress test'

const serverNameQuery = 'a.govuk-header__link.govuk-header__service-name, a.govuk-header__link--service-name'

const managePagePath = '/manage-prototype'

describe('change service name', () => {
  afterEach(restoreStarterFiles)

  it('The service name should change to "cypress test" and the task should be set to "Done"', () => {
    waitForApplication('/')

    cy.get('.govuk-heading-xl').contains(originalText)
    cy.get('p strong').contains(appConfigPath)
    cy.get(`main a[href="${managePagePath}"]`).contains('Manage your prototype').click()

    cy.task('log', 'Visit the manage prototype page')

    cy.get(serverNameQuery).contains(originalText)
    cy.get('.govuk-prototype-kit-manage-prototype-task-list__item')
      .contains(appConfigPath)
      .get('.govuk-prototype-kit-manage-prototype-task-list__tag').contains('To do')

    cy.task('replaceTextInFile', { filename: appConfig, originalText, newText })

    waitForApplication(managePagePath)

    cy.get(serverNameQuery).contains(newText)
    cy.get('.govuk-prototype-kit-manage-prototype-task-list__item')
      .contains(appConfigPath)
      .get('.govuk-prototype-kit-manage-prototype-task-list__tag').contains('Done')

    cy.visit('/index')
    cy.get('.govuk-heading-xl').contains(newText)
  })
})
