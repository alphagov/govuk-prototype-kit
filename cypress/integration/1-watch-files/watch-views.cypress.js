const path = require('path')

const { waitForApplication } = require('../utils')

const templatesView = path.join(Cypress.env('packageFolder') || Cypress.env('projectFolder'), 'docs', 'views', 'templates', 'start.html')
const appView = path.join(Cypress.env('projectFolder'), 'app', 'views', 'start.html')
const pagePath = '/start'

describe('watching start page', () => {
  before(() => {
    waitForApplication()
    cy.task('deleteFile', { filename: appView })
  })

  after(() => {
    cy.task('deleteFile', { filename: appView })
  })

  it('Add and remove the start page', () => {
    cy.task('log', 'The start page should not be found')
    cy.visit(pagePath, { failOnStatusCode: false })
    cy.get('body')
      .should('contains.text', `Page not found: ${pagePath}`)

    cy.task('log', `Copy ${templatesView} to ${appView}`)
    cy.task('copyFile', { source: templatesView, target: appView })

    cy.task('log', 'The start page should be displayed')
    cy.visit(pagePath)
    cy.get('h1')
      .should('contains.text', 'Service name goes here')
  })
})
