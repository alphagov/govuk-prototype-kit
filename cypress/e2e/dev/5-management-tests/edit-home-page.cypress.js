// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, restoreStarterFiles } = require('../../utils')

const appHomePath = path.join('app', 'views', 'index.html')
const appHome = path.join(Cypress.env('projectFolder'), appHomePath)

const originalText = 'Service name goes here'
const newText = 'Cypress test service'

const managePagePath = '/manage-prototype'

describe('edit home page', () => {
  afterEach(restoreStarterFiles)

  it(`The home page heading should change to "${newText}" and the task should be set to "Done"`, () => {
    waitForApplication(managePagePath)

    cy.task('log', 'Visit the manage prototype templates page')

    cy.get('.nowprototypeit-manage-prototype-task-list__item')
      .contains(appHomePath)
      .get('.nowprototypeit-manage-prototype-task-list__tag').contains('To do')

    cy.visit('/index')
    cy.get('.govuk-heading-xl').contains(originalText)

    cy.task('replaceTextInFile', { filename: appHome, originalText: '{{ serviceName }}', newText })

    waitForApplication(managePagePath)

    cy.get('.nowprototypeit-manage-prototype-task-list__item')
      .contains(appHomePath)
      .get('.nowprototypeit-manage-prototype-task-list__tag').contains('Done')

    cy.visit('/index')
    cy.get('.govuk-heading-xl').contains(newText)
  })
})
