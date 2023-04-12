const path = require('path')
const { waitForApplication } = require('../../utils')
const completelyBrokenRoutesContent = 'lkewjflkjadsf'
const appRoutesPath = path.join('app', 'routes.js')
const appRoutes = path.join(Cypress.env('projectFolder'), appRoutesPath)

const pageName = 'There is an error'
const contactSupportText = 'You can try and fix this yourself or contact the GOV.UK Prototype Kit team if you need help.'
const expectedErrorText = `ReferenceError: ${completelyBrokenRoutesContent} is not defined`

describe('Fatal Error Test', () => {
  after(() => {
    cy.task('log', `Restore ${appRoutesPath}`)
    cy.task('copyFromStarterFiles', { filename: appRoutesPath })
  })

  it('make sure homepage is displayed', () => {
    cy.task('copyFromStarterFiles', { filename: appRoutesPath })

    waitForApplication('/')

    cy.get('main').contains('Manage your prototype')
  })

  it('fatal error should show an error page', () => {
    cy.task('log', `Replace ${appRoutes} with Cypress routes`)
    cy.task('createFile', { filename: appRoutes, data: completelyBrokenRoutesContent })

    cy.wait(3000)
    cy.visit('/', { failOnStatusCode: false })

    cy.get('.govuk-heading-l').contains(pageName)
    cy.get('.govuk-body').contains(contactSupportText)
    cy.get('code').contains(expectedErrorText)
  })

  it('resolving the fatal error should bring back the homepage', () => {
    cy.task('copyFromStarterFiles', { filename: appRoutesPath })

    waitForApplication('/')

    cy.get('main').contains('Manage your prototype')
  })
})
