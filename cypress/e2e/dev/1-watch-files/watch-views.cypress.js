
// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication } = require('../../utils')

const templatesView = path.join(Cypress.config('fixturesFolder'), 'views', 'start.html')
const appViewHtml = path.join(Cypress.env('projectFolder'), 'app', 'views', 'start.html')
const appViewNjk = path.join(Cypress.env('projectFolder'), 'app', 'views', 'start.html')
const pagePath = '/start'

describe('watching start page', () => {
  before(() => {
    cy.task('deleteFile', { filename: appViewHtml })
    cy.task('deleteFile', { filename: appViewNjk })
  })

  it('Add and remove the start page with html extension', () => {
    waitForApplication()

    cy.task('log', 'The start page should not be found')
    cy.visit(pagePath, { failOnStatusCode: false })
    cy.get('body')
      .should('contains.text', `Page not found: ${pagePath}`)

    cy.task('log', `Copy ${templatesView} to ${appViewHtml}`)
    cy.task('copyFile', { source: templatesView, target: appViewHtml })

    cy.task('log', 'The start page should be displayed')
    cy.visit(pagePath)
    cy.get('.govuk-button--start')
      .should('contains.text', 'Start now')
  })

  it('Add and remove the start page with njk extension', () => {
    waitForApplication()

    cy.task('log', 'The start page should not be found')
    cy.visit(pagePath, { failOnStatusCode: false })
    cy.get('body')
      .should('contains.text', `Page not found: ${pagePath}`)

    cy.task('log', `Copy ${templatesView} to ${appViewNjk}`)
    cy.task('copyFile', { source: templatesView, target: appViewNjk })

    cy.task('log', 'The start page should be displayed')
    cy.visit(pagePath)
    cy.get('.govuk-button--start')
      .should('contains.text', 'Start now')
  })
})
