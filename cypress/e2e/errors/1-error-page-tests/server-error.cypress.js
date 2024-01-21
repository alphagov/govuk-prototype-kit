const path = require('path')
const { waitForApplication, restoreStarterFiles } = require('../../utils')
const routesFixture = path.join(Cypress.config('fixturesFolder'), 'routes.js')
const appRoutesPath = path.join('app', 'routes.js')
const appRoutes = path.join(Cypress.env('projectFolder'), appRoutesPath)

const homePageName = 'GOV.UK Prototype Kit'
const errorPageName = 'There is an error'
const contactSupportText = 'Get support'

describe('Server Error Test', () => {
  beforeEach(() => {
    cy.task('log', `Replace ${appRoutes} with Cypress routes`)
    cy.task('copyFile', { source: routesFixture, target: appRoutes })
  })

  afterEach(restoreStarterFiles)

  it('internal server error results in 500 page being displayed correctly', () => {
    const expectedErrorFileAndLine = `${['app', 'routes.js'].join(Cypress.config('pathSeparator'))} (line 18)`
    const expectedErrorMessage = 'test error'

    waitForApplication()

    cy.visit('/error', { failOnStatusCode: false })

    cy.get('.govuk-heading-l').contains(errorPageName)
    cy.get('.govuk-body .govuk-link').contains(contactSupportText)
    cy.get('#nowprototypeit-error-file').contains(expectedErrorFileAndLine)
    cy.get('#nowprototypeit-error-message').contains(expectedErrorMessage)
  })

  it('shows an error if a template cannot be found', () => {
    const templateNotFoundText = 'template not found: test-page.html'

    waitForApplication()

    cy.visit('/test-page', { failOnStatusCode: false })

    cy.get('.govuk-heading-l').contains(errorPageName)
    cy.get('.govuk-body .govuk-link').contains(contactSupportText)
    cy.get('#nowprototypeit-error-message').contains(templateNotFoundText)
  })

  it('shows an error if sass is broken', () => {
    const brokenStylesFixture = path.join(Cypress.config('fixturesFolder'), 'sass', 'broken-styles.scss')
    const appSassPath = path.join('app', 'assets', 'sass', 'application.scss')
    const appSass = path.join(Cypress.env('projectFolder'), appSassPath)
    const brokenSassText = 'color red'

    waitForApplication()

    // Page has no error
    cy.get('.govuk-heading-l').contains(homePageName)

    // Break the application.scss
    cy.task('copyFile', { source: brokenStylesFixture, target: appSass })

    cy.wait(2000)

    // Page now shows an error
    cy.get('.govuk-heading-l').contains(errorPageName)
    cy.get('.govuk-body .govuk-link').contains(contactSupportText)
    cy.get('#nowprototypeit-error-line').contains(brokenSassText)

    // Restore the application.scss from prototype starter
    cy.task('copyFromStarterFiles', { filename: appSassPath })

    waitForApplication()

    // Page should recover with no error
    cy.get('.govuk-heading-l').contains(homePageName)
  })
})
