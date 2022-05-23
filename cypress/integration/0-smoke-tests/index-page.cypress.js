specify('index page', () => {
  cy.visit('/')
  cy.contains('GOV.UK Prototype Kit')
})
