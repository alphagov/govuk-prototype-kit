const path = require('path')
const completelyBrokenRoutesFixture = path.join(Cypress.config('fixturesFolder'), 'completely-broken-routes.js')
const appRoutesPath = path.join('app', 'routes.js')
const appRoutes = path.join(Cypress.env('projectFolder'), appRoutesPath)

const pageName = 'There is an error'
const contactSupportText = 'You can try and fix this yourself or contact the GOV.UK Prototype Kit team if you need help.'
const expectedErrorText = 'ReferenceError: lkewjflkjadsf is not defined'

const homePageName = 'GOV.UK Prototype Kit'

function restore () {
  // Restore config.json from prototype starter
  cy.task('log', `Restore ${appRoutesPath}`)
  cy.task('copyFromStarterFiles', { filename: appRoutesPath })
}

describe('Fatal Error Test', () => {
  before(restore)
  after(restore)

  it('fatal error should show an error page', () => {
    cy.task('waitUntilAppRestarts')
    cy.visit('/', { failOnStatusCode: false })

    cy.get('.govuk-heading-l').contains(homePageName)

    cy.task('log', `Replace ${appRoutes} with Broken routes`)
    cy.task('copyFile', { source: completelyBrokenRoutesFixture, target: appRoutes })

    cy.get('.govuk-heading-l').contains(pageName)
    cy.get('.govuk-body').contains(contactSupportText)
    cy.get('code').contains(expectedErrorText)

    cy.task('log', `Restore ${appRoutes} with original routes`)
    restore()

    cy.get('.govuk-heading-l').contains(homePageName)
  })
})
