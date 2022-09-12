const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForApplication = async (headingText) => {
  cy.task('log', 'Waiting for app to restart and load home page')
  cy.task('waitUntilAppRestarts')
  cy.visit('/index')
  cy.get('h1.govuk-heading-xl')
    .should('contains.text', headingText || 'Service name goes here')
}

const copyFile = (source, target) => {
  cy.task('log', `Copy ${source} to ${target}`)
  cy.task('copyFile', { source, target })
}

const deleteFile = (filename) => {
  cy.task('log', `Delete ${filename}`)
  cy.task('deleteFile', { filename })
}

module.exports = {
  sleep,
  waitForApplication,
  copyFile,
  deleteFile
}
