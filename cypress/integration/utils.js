const waitForApplication = async () => {
  cy.task('log', 'Waiting for app to restart and load home page')
  cy.task('waitUntilAppRestarts')
  cy.visit('/')
  cy.get('h1.govuk-heading-xl')
    .should('contains.text', 'Prototype your service using GOV.UK Prototype Kit')
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
  waitForApplication,
  copyFile,
  deleteFile
}
