const { hostName } = require('../config')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForApplication = async () => {
  cy.task('log', 'Waiting for app to restart and load home page')
  cy.task('waitUntilAppRestarts')
  cy.visit(hostName)
  cy.get('h1.govuk-heading-xl', { timeout: 20000 })
    .should('contains.text', 'Prototype your service using GOV.UK Prototype Kit')
}

module.exports = {
  sleep,
  waitForApplication
}
