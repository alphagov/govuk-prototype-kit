const { waitForApplication } = require('../../utils')

const pageName = 'Page not found'
const checkPageNotFoundText = 'There is no page at /p4ge-n0t-f0und'
const helpText = 'This may be because:'
const helpList = [
  'you typed or pasted the web address incorrectly',
  'a link in your code is wrong',
  'a form in your code is wrong',
  'you have not created the page yet']
const contactSupportText = 'You can try and fix this yourself or contact the GOV.UK Prototype Kit team if you need help.'

it('internal server error results in 500 page being displayed correctly', () => {
  waitForApplication()

  cy.visit('/p4ge-n0t-f0und', { failOnStatusCode: false })
  cy.get('.govuk-heading-l').contains(pageName)
  cy.get('.govuk-body').contains(checkPageNotFoundText)
  cy.get('.govuk-body').contains(helpText)
  for (const hint of helpList) {
    cy.get('li').contains(hint)
  }
  cy.get('.govuk-body').contains(contactSupportText)
})
