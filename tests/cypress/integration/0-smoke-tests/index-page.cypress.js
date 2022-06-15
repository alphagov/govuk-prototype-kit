/* eslint-env cypress/globals */

specify('index page', () => {
  cy.visit('/')
  cy.contains('GOV.UK Prototype Kit')
})
