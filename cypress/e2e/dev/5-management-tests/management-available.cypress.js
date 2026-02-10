// local dependencies
const { waitForApplication } = require('../../utils')

describe('management available', () => {
  it('when attempting to visit "/manage-prototype" page', () => {
    waitForApplication()
    cy.visit('/manage-prototype')
    cy.get('h1').should('contain.text', 'Manage your prototype')
  })

  it('manage prototype link should exist on the home page', () => {
    waitForApplication()
    cy.visit('/')
    cy.get('main a[href="/manage-prototype"]').should('contain.text', 'Manage your prototype')
  })

  it('manage prototype link should exist in the footer', () => {
    waitForApplication()
    cy.visit('/')
    cy.get('.govuk-footer a[href="/manage-prototype"]').should('contain.text', 'Manage your prototype')
  })

  it('clear data link should exist in the footer and work correctly', () => {
    waitForApplication()
    cy.visit('/')
    cy.get('.govuk-footer a[href="/manage-prototype/clear-data"]').should('contain.text', 'Clear data').click()
    cy.get('h1').should('contain.text', 'Clear session data')
  })
})
