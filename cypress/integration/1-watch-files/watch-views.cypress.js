import { hostName } from '../../config'
import { waitForApplication } from '../utils'

const templatesView = 'docs/views/templates/start.html'
const appView = 'app/views/start.html'
const pagePath = '/start'
const pageUrl = `${hostName}${pagePath}`

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
    cy.visit(pageUrl, { failOnStatusCode: false })
    cy.get('body', { timeout: 20000 })
      .should('contains.text', `Page not found: ${pagePath}`)

    cy.task('log', `Copy ${templatesView} to ${appView}`)
    cy.task('copyFile', { source: templatesView, target: appView })

    cy.task('log', 'The start page should be displayed')
    cy.visit(pageUrl)
    cy.get('h1', { timeout: 20000 })
      .should('contains.text', 'Service name goes here')
  })
})
