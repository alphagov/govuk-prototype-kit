
// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication } = require('../../utils')

const appHomePath = path.join('app', 'views', 'index.html')
const appConfigPath = path.join('app', 'config.json')
const appHome = path.join(Cypress.env('projectFolder'), appHomePath)

const originalText = 'Service name goes here'
const newText = 'Cypress test service'

const managePagePath = '/manage-prototype'

describe('edit home page', () => {
  before(() => {
    // Restore index.html and config.json from prototype starter
    cy.task('copyFromStarterFiles', { filename: appHomePath })
    cy.task('copyFromStarterFiles', { filename: appConfigPath })
    waitForApplication(managePagePath)
  })

  it(`The home page heading should change to "${newText}" and the task should be set to "Done"`, () => {
    cy.task('log', 'Visit the manage prototype templates page')

    cy.get('.app-task-list__item')
      .eq(1).should('contains.text', appHomePath)
      .get('.app-task-list__tag').should('contains.text', 'To do')

    cy.visit('/index')
    cy.get('.govuk-heading-xl').should('contains.text', originalText)

    cy.task('replaceTextInFile', { filename: appHome, originalText: '{{ serviceName }}', newText })

    waitForApplication(managePagePath)

    cy.get('.app-task-list__item')
      .eq(1).should('contains.text', appHomePath)
      .get('.app-task-list__tag').should('contains.text', 'Done')

    cy.visit('/index')
    cy.get('.govuk-heading-xl').should('contains.text', newText)
  })
})
