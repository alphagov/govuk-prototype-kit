const { authenticate } = require('../../utils')

describe('management not available', () => {
  before(() => {
    cy.task('waitUntilAppRestarts')
  })

  it('when attempting to visit "/manage-prototype" page', () => {
    cy.visit('/manage-prototype')
    authenticate()
    cy.get('h1').should('contain.text', 'How to manage your prototype')
  })

  it('when attempting to visit "/manage-prototype/templates" page', () => {
    cy.visit('/manage-prototype/templates')
    authenticate()
    cy.get('h1').should('contain.text', 'How to manage your prototype')
  })

  it('when attempting to visit "/manage-prototype/plugins" page', () => {
    cy.visit('/manage-prototype/plugins')
    authenticate()
    cy.get('h1').should('contain.text', 'How to manage your prototype')
  })

  it('when attempting to visit "/manage-prototype/foo" page', () => {
    cy.visit('/manage-prototype/foo')
    authenticate()
    cy.get('h1').should('contain.text', 'How to manage your prototype')
  })

  it('manage prototype link should not exist on the home page', () => {
    cy.visit('/')
    authenticate()
    cy.get('main a[href="/manage-prototype"]').should('not.exist')
  })

  it('manage prototype link should not exist in the footer', () => {
    cy.visit('/')
    authenticate()
    cy.get('footer a[href="/manage-prototype"]').should('not.exist')
  })

  it('clear data link should exist in the footer and work correctly', () => {
    cy.visit('/')
    authenticate()
    cy.get('footer a[href="/manage-prototype/clear-data"]').should('contain.text', 'Clear data').click()
    cy.get('h1').should('contain.text', 'Clear session data')
  })
})
