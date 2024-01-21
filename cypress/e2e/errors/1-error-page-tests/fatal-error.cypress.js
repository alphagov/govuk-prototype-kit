const path = require('path')
const { restoreStarterFiles } = require('../../utils')
const completelyBrokenRoutesFixture = path.join(Cypress.config('fixturesFolder'), 'completely-broken-routes.js')
const appRoutesPath = path.join('app', 'routes.js')
const appRoutes = path.join(Cypress.env('projectFolder'), appRoutesPath)

const pageName = 'There is an error'
const contactSupportText = 'Get support'
const expectedErrorFileAndLine = `${['app', 'routes.js'].join(Cypress.config('pathSeparator'))} (line 1)`
const expectedErrorMessage = 'lkewjflkjadsf is not defined'

const homePageName = 'GOV.UK Prototype Kit'

describe('Fatal Error Test', () => {
  afterEach(restoreStarterFiles)

  it('fatal error should show an error page', () => {
    cy.task('waitUntilAppRestarts')
    cy.visit('/', { failOnStatusCode: false })

    cy.get('.govuk-heading-l').contains(homePageName)

    cy.task('log', `Replace ${appRoutes} with Broken routes`)
    cy.task('copyFile', { source: completelyBrokenRoutesFixture, target: appRoutes })

    cy.wait(5000)

    cy.get('.govuk-heading-l').contains(pageName)
    cy.get('.govuk-body .govuk-link').contains(contactSupportText)
    cy.get('#nowprototypeit-error-file').contains(expectedErrorFileAndLine)
    cy.get('#nowprototypeit-error-message').contains(expectedErrorMessage)

    cy.task('log', `Restore ${appRoutes} with original routes`)
    cy.task('copyFromStarterFiles', { filename: appRoutesPath })

    cy.wait(5000)

    cy.get('.govuk-heading-l').contains(homePageName)
  })
})
