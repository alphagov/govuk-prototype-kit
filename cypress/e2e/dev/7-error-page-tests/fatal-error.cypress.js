const path = require('path')
const completelyBrokenRoutesFixture = path.join(Cypress.config('fixturesFolder'), 'completely-broken-routes.js')
const appRoutesPath = path.join('app', 'routes.js')
const appRoutes = path.join(Cypress.env('projectFolder'), appRoutesPath)

const pageName = 'There is an error'
const contactSupportText = 'You can try and fix this yourself or contact the GOV.UK Prototype Kit team if you need help.'
const expectedErrorText = 'ReferenceError: lkewjflkjadsf is not defined'

describe('Fatal Error Test', () => {
  before(() => {
    cy.task('log', `Replace ${appRoutes} with Cypress routes`)
    cy.task('copyFile', { source: completelyBrokenRoutesFixture, target: appRoutes })
  })

  after(() => {
    cy.task('log', `Restore ${appRoutesPath}`)
    cy.task('copyFromStarterFiles', { filename: appRoutesPath })
  })

  it('fatal error should show an error page', () => {
    cy.visit('/', { failOnStatusCode: false })

    cy.get('.govuk-heading-l').contains(pageName)
    cy.get('.govuk-body').contains(contactSupportText)
    cy.get('code').contains(expectedErrorText)
  })
})
