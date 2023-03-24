const { waitForApplication } = require('../../utils')
const { setRouterBackToInitialState, setupRouterForErrorTest } = require('./error-utils')

const pageName = 'There is an error in your code'
const contactSupportText = 'You can try and fix this yourself or contact the GOV.UK Prototype Kit team if you need help.'

const templateNotFoundText = 'template not found: test-page.html'

describe('Server Error Test', async () => {
  it('internal server error results in 500 page being displayed correctly', () => {
    setupRouterForErrorTest()
    waitForApplication()

    cy.visit('/error', { failOnStatusCode: false })
    cy.get('.govuk-heading-l').contains(pageName)
    cy.get('.govuk-body').contains(contactSupportText)

    setRouterBackToInitialState()
  })
  it('shows an error if a template cannot be found', () => {
    setupRouterForErrorTest()
    waitForApplication()

    cy.visit('/test-page', { failOnStatusCode: false })
    cy.get('.govuk-heading-l').contains(pageName)
    cy.get('.govuk-body').contains(contactSupportText)
    cy.get('code').contains(templateNotFoundText)

    setRouterBackToInitialState()
  })
})
