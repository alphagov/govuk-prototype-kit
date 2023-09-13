const { createAndStartPrototype } = require('../../utils')
const { performPluginAction } = require('../../plugins/plugin-utils')
const port = '3020'
const versions = [
  // '13.1.0',
  // '13.4.0',
  '13.8.0',
  '13.13.0'
]
describe('Upgrade to current version', () => {
  versions.map((version) => it(`Check update from ${version} works correctly`, () => {
    createAndStartPrototype(version, port)
    cy.origin(`http://localhost:${port}`, () => {
      cy.visit(`/manage-prototype/plugins`, { timeout: 20000, retryOnNetworkFailure: true })

      cy.get(`[data-plugin-package-name="govuk-prototype-kit"]`)
        .scrollIntoView()
        .find('button')
        .contains('Up')
        .click()

      performPluginAction('upgrade', 'govuk-prototype-kit', 'GOV.UK Prototype Kit')

      cy.wait(5000)
    })
  }))
})
