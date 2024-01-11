const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const log = (message) => cy.task('log', message)

const authenticate = () => {
  const password = Cypress.env('password')
  if (password) {
    log(`Authenticating with ${password}`)
    cy.get('input#password').type(password)
    cy.get('form').submit()
  }
}

const waitForApplication = async (path = '/index') => {
  log(`Waiting for app to restart and load ${path} page`)
  cy.task('waitUntilAppRestarts')
  cy.visit(path)
  cy.get('.govuk-header__logotype')
    .contains('GOV.UK')
}

const copyFile = (source, target) => {
  log(`Copy ${source} to ${target}`)
  cy.task('copyFile', { source, target })
}

const deleteFile = (filename) => {
  log(`Delete ${filename}`)
  cy.task('deleteFile', { filename })
}

const createFile = (filename, options) => {
  log(`Create ${filename}`)
  cy.task('createFile', { filename, ...options })
}

const replaceInFile = (filename, originalText, source, newText) => {
  cy.task('replaceTextInFile', { filename, originalText, source, newText })
}

const restoreStarterFiles = () => {
  cy.task('restoreStarterFiles')
}

function uninstallPlugin (plugin) {
  log(`Uninstalling ${plugin}`)
  cy.exec(`cd ${Cypress.env('projectFolder')} && npm uninstall ${plugin}`)
  cy.task('pluginUninstalled', { plugin, timeout: 15000 })
}

function installPlugin (plugin, version = '') {
  if (version) {
    version = '@' + version
  }
  log(`Installing ${plugin}${version}`)
  cy.exec(`cd ${Cypress.env('projectFolder')} && npm install ${plugin}${version} --save-exact `)
  if (plugin.startsWith('file:')) {
    plugin = plugin.substring(plugin.lastIndexOf('/') + 1)
  }
  log(`Waiting for ${plugin}${version} to be installed`)
  cy.task('pluginInstalled', { plugin, version, timeout: 15000 })
}

module.exports = {
  authenticate,
  sleep,
  log,
  waitForApplication,
  copyFile,
  deleteFile,
  createFile,
  replaceInFile,
  installPlugin,
  uninstallPlugin,
  restoreStarterFiles
}
