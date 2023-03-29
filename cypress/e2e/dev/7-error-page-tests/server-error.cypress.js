const path = require('path')
const { waitForApplication } = require('../../utils')
const routesFixture = path.join(Cypress.config('fixturesFolder'), 'routes.js')
const appRoutesPath = path.join('app', 'routes.js')
const appRoutes = path.join(Cypress.env('projectFolder'), appRoutesPath)

const pageName = 'There is an error in your code'
const contactSupportText = 'You can try and fix this yourself or contact the GOV.UK Prototype Kit team if you need help.'

const templateNotFoundText = 'template not found: test-page.html'

describe('Server Error Test', () => {
  before(() => {
    cy.task('log', `Replace ${appRoutes} with Cypress routes`)
    cy.task('copyFile', { source: routesFixture, target: appRoutes })
  })

  // after(() => {
  //   cy.task('log', `Restore ${appRoutesPath}`)
  //   cy.task('copyFromStarterFiles', { filename: appRoutesPath })
  // })

  it('internal server error results in 500 page being displayed correctly', () => {
    waitForApplication()

    cy.visit('/error', { failOnStatusCode: false })

    cy.get('.govuk-heading-l').contains(pageName)
    cy.get('.govuk-body').contains(contactSupportText)
  })
  it('shows an error if a template cannot be found', () => {
    waitForApplication()

    cy.visit('/test-page', { failOnStatusCode: false })

    cy.get('.govuk-heading-l').contains(pageName)
    cy.get('.govuk-body').contains(contactSupportText)
    cy.get('code').contains(templateNotFoundText)

    cy.task('log', `Restore ${appRoutesPath}`)
    cy.task('copyFromStarterFiles', { filename: appRoutesPath })
  })
})
