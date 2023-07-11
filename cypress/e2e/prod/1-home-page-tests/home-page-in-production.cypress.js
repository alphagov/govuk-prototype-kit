
// local dependencies
const { authenticate } = require('../../utils')

describe('home page in production', () => {
  it('should load as expected', () => {
    cy.task('waitUntilAppRestarts')
    cy.visit('/')
    authenticate()
    cy.get('h1').contains('Service name goes here')
  })
})
