const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForApplication = async () => {
  cy.task('log', 'Waiting for app to restart and load home page')
  cy.task('waitUntilAppRestarts')
  cy.visit('/')
  cy.get('h1.govuk-heading-xl')
    .should('contains.text', 'Prototype your service using GOV.UK Prototype Kit')
}

module.exports = {
  sleep,
  waitForApplication
}
