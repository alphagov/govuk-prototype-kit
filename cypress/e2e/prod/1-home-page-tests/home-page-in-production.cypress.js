
// local dependencies
const { authenticate } = require('../../utils')

describe('home page in production', () => {
  before(() => {
    cy.task('waitUntilAppRestarts')
  })

  it('should load as expected', () => {
    cy.visit('/')
    authenticate()
    cy.get('h1').contains('Service name goes here')
  })
})
