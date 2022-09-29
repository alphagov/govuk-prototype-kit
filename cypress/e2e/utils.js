const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForApplication = async (path = '/index') => {
  cy.task('log', 'Waiting for app to restart and load home page')
  cy.task('waitUntilAppRestarts')
  cy.visit(path)
  cy.get('.govuk-header__logotype-text')
    .should('contains.text', 'GOV.UK')
}

const copyFile = (source, target) => {
  cy.task('log', `Copy ${source} to ${target}`)
  cy.task('copyFile', { source, target })
}

const deleteFile = (filename) => {
  cy.task('log', `Delete ${filename}`)
  cy.task('deleteFile', { filename })
}

function uninstallPlugin (plugin) {
  cy.exec(`cd ${Cypress.env('projectFolder')} && npm uninstall ${plugin}`)
}

function installPlugin (plugin) {
  cy.exec(`cd ${Cypress.env('projectFolder')} && npm install ${plugin}`)
}

module.exports = {
  sleep,
  waitForApplication,
  copyFile,
  deleteFile,
  installPlugin,
  uninstallPlugin
}
