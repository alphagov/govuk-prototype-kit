
// npm dependencies
const { urlencode } = require('nunjucks/src/filters')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const authenticate = () => {
  const password = Cypress.env('password')
  if (password) {
    cy.task('log', `Authenticating with ${password}`)
    cy.get('input#password').type(password)
    cy.get('form').submit()
  }
}

const waitForApplication = async (path = '/index') => {
  cy.task('log', `Waiting for app to be ready to load ${path} page`)
  cy.task('waitUntilAppReady')
  cy.visit(path)
  cy.get('.govuk-header__logotype-text')
    .should('contains.text', 'GOV.UK')
}

const waitForAppRestart = async (path = '/index') => {
  cy.task('log', `Waiting for app to restart and load ${path} page`)
  cy.task('waitUntilAppRestarts')
  cy.task('log', 'App restarted')
  cy.visit(path, { retryOnStatusCodeFailure: true })
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

const createFile = (filename, options) => {
  cy.task('log', `Create ${filename}`)
  cy.task('createFile', { filename, ...options })
}

const replaceInFile = (filename, originalText, source, newText) => {
  cy.task('replaceTextInFile', { filename, originalText, source, newText })
}

const getTemplateLink = (type, packageName, path) => {
  const queryString = `?package=${urlencode(packageName)}&template=${urlencode(path)}`
  return `/manage-prototype/templates/${type}${queryString}`
}

function installedPlugins () {
  return cy.visit('/manage-prototype/plugins', { retryOnStatusFailure: true })
    .get('[data-plugin-group-status="installed"] li')
    .then(($elements) => {
      const installedPlugins = $elements.map((i, el) => {
        return Cypress.$(el).attr('data-plugin-package-name')
      })

      return installedPlugins.get()
    })
}

function installPlugins (...plugins) {
  const installString = plugins.join(' ')
  cy.task('log', `Installing ${installString}`)
  cy.exec(`cd ${Cypress.env('projectFolder')} && npm install ${installString}`)

  const pluginPackageNames = plugins.map((plugin) => {
    if (plugin.startsWith('file:')) {
      plugin = plugin.substring(plugin.lastIndexOf('/') + 1)
    }
    if (plugin.includes('@', 1)) {
      plugin = plugin.substring(0, plugin.indexOf('@', 1))
    }
    return plugin
  })

  cy.task('log', `Waiting for ${pluginPackageNames.join(' ')} to be installed`)
  cy.task('waitUntilAppRestarts', { timeout: 60000 })
  installedPlugins().should('include.members',
    pluginPackageNames
  )
  cy.task('log', `Plugins ${pluginPackageNames.join(' ')} successfully installed`)
}

function uninstallPlugins (...plugins) {
  const uninstallString = plugins.join(' ')
  cy.task('log', `Uninstalling ${uninstallString}`)
  cy.exec(`cd ${Cypress.env('projectFolder')} && npm uninstall ${uninstallString}`)

  cy.task('waitUntilAppRestarts', { timeout: 60000 })
  installedPlugins().should('not.include.members',
    plugins
  )
  cy.task('log', `Plugins ${plugins.join(' ')} successfully uninstalled`)
}

module.exports = {
  authenticate,
  sleep,
  waitForApplication,
  waitForAppRestart,
  getTemplateLink,
  copyFile,
  deleteFile,
  createFile,
  replaceInFile,
  installPlugins,
  uninstallPlugins
}
