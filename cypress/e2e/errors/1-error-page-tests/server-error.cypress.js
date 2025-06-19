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
    cy.get('#govuk-prototype-kit-error-file').contains(expectedErrorFileAndLine)
    cy.get('#govuk-prototype-kit-error-message').contains(expectedErrorMessage)
  })

  it('shows an error if a template cannot be found', () => {
    const templateNotFoundText = 'template not found: test-page.html'

    waitForApplication()

    cy.visit('/test-page', { failOnStatusCode: false })

    cy.get('.govuk-heading-l').contains(errorPageName)
    cy.get('.govuk-body .govuk-link').contains(contactSupportText)
    cy.get('#govuk-prototype-kit-error-message').contains(templateNotFoundText)
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
    cy.get('#govuk-prototype-kit-error-line').contains(brokenSassText)

    // Restore the application.scss from prototype starter
    cy.task('copyFromStarterFiles', { filename: appSassPath })

    waitForApplication()

    // Page should recover with no error
    cy.get('.govuk-heading-l').contains(homePageName)
  })

  it('shows an error if session-data-defaults.js is malformed', () => {
    const brokenSessionDataDefaultsFixture = path.join(Cypress.config('fixturesFolder'), 'broken-session-data-defaults.js')
    const appSessionDataDefaultsPath = path.join('app', 'data', 'session-data-defaults.js')
    const appSessionDataDefaults = path.join(Cypress.env('projectFolder'), appSessionDataDefaultsPath)

    waitForApplication()

    // Page has no error
    cy.get('.govuk-heading-l').contains(homePageName)

    // Break session-data-defaults.js
    cy.task('copyFile', { source: brokenSessionDataDefaultsFixture, target: appSessionDataDefaults })

    cy.wait(2000)

    // Page now shows an error
    cy.get('.govuk-heading-l').contains(errorPageName)
    cy.get('.govuk-body .govuk-link').contains(contactSupportText)
    cy.get('#govuk-prototype-kit-error-line').contains('broken')

    // Restore session-data-defaults.js from prototype starter
    cy.task('copyFromStarterFiles', { filename: appSessionDataDefaultsPath })

    waitForApplication()

    // Page should recover with no error
    cy.get('.govuk-heading-l').contains(homePageName)
  })
})
