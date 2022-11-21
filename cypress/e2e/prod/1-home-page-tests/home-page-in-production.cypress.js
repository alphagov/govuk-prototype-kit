const { waitForApplication } = require('../../utils')

describe('home page in production', () => {
  before(() => {
    waitForApplication()
  })

  it('should load as expected', () => {
    cy.visit('/')
    cy.get('h1').should('contains.text', 'Service name goes here')
  })
})
