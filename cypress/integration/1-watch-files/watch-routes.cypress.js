const path = require('path')

const { waitForApplication } = require('../utils')

const routesFixture = path.join(Cypress.config('fixturesFolder'), 'routes.js')
const appRoutes = path.join(Cypress.env('projectFolder'), 'app', 'routes.js')
const backupRoutes = path.join(Cypress.env('tempFolder'), 'temp-routes.js')
const appUrl = 'http://localhost:3000'
const pagePath = '/cypress-test'
const pageUrl = `${appUrl}${pagePath}`

describe('watch route file', () => {
  before(() => {
    waitForApplication()
    // backup routes
    cy.task('copyFile', { source: appRoutes, target: backupRoutes })
  })

  after(() => {
    // delete backup routes
    cy.task('deleteFile', { filename: backupRoutes })
  })

  it(`add and remove ${pageUrl} route`, () => {
    cy.task('log', 'The cypress test page should not be found')
    cy.visit(pageUrl, { failOnStatusCode: false })
    cy.get('body', { timeout: 20000 })
      .should('contains.text', `Page not found: ${pagePath}`)

    cy.task('log', `Replace ${appRoutes} with Cypress routes`)
    cy.task('copyFile', { source: routesFixture, target: appRoutes })

    waitForApplication()

    cy.task('log', 'The cypress test page should be displayed')
    cy.visit(pageUrl)
    cy.get('h1', { timeout: 20000 })
      .should('contains.text', 'CYPRESS TEST PAGE')

    cy.task('log', `Restore ${appRoutes}`)
    cy.task('copyFile', { source: backupRoutes, target: appRoutes })

    waitForApplication()

    cy.task('log', 'The cypress test page should not be found')
    cy.visit(pageUrl, { failOnStatusCode: false })
    cy.get('body', { timeout: 20000 })
      .should('contains.text', `Page not found: ${pagePath}`)
  })
})
