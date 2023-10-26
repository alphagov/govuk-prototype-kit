// local dependencies
const { authenticate, restoreStarterFiles } = require('../../utils')

describe('home page in production', () => {
  after(restoreStarterFiles)

  it('should load as expected', () => {
    cy.task('waitUntilAppRestarts')
    cy.visit('/')
    authenticate()
    cy.get('h1').contains('Service name goes here')
  })
})
