// npm dependencies
const { capitalize } = require('lodash')
const { urlencode } = require('nunjucks/src/filters')
const { waitForApplication } = require('../utils')

const manageTemplatesPagePath = '/manage-prototype/templates'
const managePluginsPagePath = '/manage-prototype/plugins'
const manageInstalledPluginsPagePath = '/manage-prototype/plugins-installed'

const panelProcessingQuery = '[aria-live="polite"] #panel-processing'
const panelCompleteQuery = '[aria-live="polite"] #panel-complete'
const panelErrorQuery = '[aria-live="polite"] #panel-error'

function getTemplateLink (type, packageName, path) {
  const queryString = `?package=${urlencode(packageName)}&template=${urlencode(path)}`
  return `${manageTemplatesPagePath}/${type}${queryString}`
}

async function loadPluginsPage () {
  cy.task('log', 'Visit the manage prototype plugins page')
  await waitForApplication(managePluginsPagePath)
}

async function loadInstalledPluginsPage () {
  cy.task('log', 'Visit the manage prototype plugins page')
  await waitForApplication(manageInstalledPluginsPagePath)
}

async function loadTemplatesPage () {
  cy.task('log', 'Visit the manage prototype templates page')
  await waitForApplication(manageTemplatesPagePath)
}

function provePluginTemplatesInstalled (plugin) {
  cy.visit(manageTemplatesPagePath)
  cy.get(`[data-plugin-package-name="${plugin}"]`).should('exist')
}

function provePluginTemplatesUninstalled (plugin) {
  cy.visit(manageTemplatesPagePath)
  cy.get(`[data-plugin-package-name="${plugin}"]`).should('not.exist')
}

function initiatePluginAction (action, plugin, pluginName, options = {}) {
  if (action === 'install') {
    cy.visit(managePluginsPagePath)
  } else {
    cy.visit(manageInstalledPluginsPagePath)
  }

  if (pluginName) {
    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('h4')
      .contains(pluginName)
  }

  cy.get(`[data-plugin-package-name="${plugin}"]`)
    .scrollIntoView()
    .find('button')
    .contains(capitalize(action))
    .click()

  if (options.confirmation) {
    options.confirmation()
  }

  performPluginAction(action, plugin, pluginName)
}

function provePluginInstalled (plugin, pluginName) {
  cy.visit(managePluginsPagePath)
  if (pluginName) {
    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('h4')
      .contains(pluginName)
  }

  cy.get(`[data-plugin-package-name="${plugin}"] strong.govuk-tag`)
    .contains('Installed')

  cy.get('#installed-plugins-link').click()

  cy.get(`[data-plugin-package-name="${plugin}"]`)
    .should('exist')
}

function provePluginUninstalled (plugin, pluginName) {
  cy.visit(managePluginsPagePath)
  if (pluginName) {
    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('h4')
      .contains(pluginName)
  }

  cy.get(`[data-plugin-package-name="${plugin}"] strong.govuk-tag`)
    .should('not.exist')

  cy.get('#installed-plugins-link').click()

  cy.get(`[data-plugin-package-name="${plugin}"]`)
    .should('not.exist')
}

function provePluginUpdated (plugin, pluginName) {
  provePluginInstalled(plugin, pluginName)
  cy.get(`[data-plugin-package-name="${plugin}"]`)
    .scrollIntoView()
    .find('button')
    .contains(capitalize('update')).should('not.exist')
}

function provePluginInstalledOldVersion (plugin, pluginName) {
  cy.visit(managePluginsPagePath)
  if (pluginName) {
    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('h4')
      .contains(pluginName)
  }

  cy.get('#installed-plugins-link').click()

  cy.get(`[data-plugin-package-name="${plugin}"]`)
    .should('exist')
}

function performPluginAction (action, plugin, pluginName) {
  cy.task('log', `The ${plugin} plugin should be displayed`)

  if (pluginName) {
    cy.get('h2')
      .contains(pluginName)
  }

  const processingText = `${action === 'update' ? 'Updat' : action}ing ...`

  if (Cypress.env('skipPluginActionInterimStep') !== 'true') {
    cy.get(panelCompleteQuery, { timeout: 20000 })
      .should('not.be.visible')
    cy.get(panelErrorQuery)
      .should('not.be.visible')
    cy.get(panelProcessingQuery)
      .should('be.visible')
      .contains(capitalize(processingText))
  }

  cy.task('log', `The ${plugin} plugin is ${action === 'update' ? 'updat' : action}ing`)

  cy.get(panelProcessingQuery, { timeout: 20000 })
    .should('not.be.visible')
  cy.get(panelErrorQuery)
    .should('not.be.visible')
  cy.get(panelCompleteQuery)
    .should('be.visible')
    .contains(`${capitalize(action)} complete`)

  cy.task('log', `The ${plugin} plugin ${action} has completed`)

  cy.get('#instructions-complete a')
    .contains('Back to plugins')
    .click()

  cy.task('log', 'Returning to plugins page')

  cy.get('h1').contains('Plugins')
}

function failAction (action) {
  cy.get('#plugin-action-button').click()

  if (Cypress.env('skipPluginActionInterimStep') !== 'true') {
    cy.get(panelCompleteQuery, { timeout: 20000 })
      .should('not.be.visible')
    cy.get(panelErrorQuery)
      .should('not.be.visible')
    cy.get(panelProcessingQuery)
      .should('be.visible')
      .contains(`${capitalize(action === 'update' ? 'Updat' : action)}ing ...`)
  }

  cy.get(panelProcessingQuery, { timeout: 40000 })
    .should('not.be.visible')
  cy.get(panelCompleteQuery)
    .should('not.be.visible')
  cy.get(panelErrorQuery)
    .should('be.visible')

  cy.get(`${panelErrorQuery} .govuk-panel__title`)
    .contains(`There was a problem ${action === 'update' ? 'Updat' : action}ing`)
  cy.get(`${panelErrorQuery} a`)
    .contains('Please contact support')
}

module.exports = {
  managePluginsPagePath,
  manageInstalledPluginsPagePath,
  manageTemplatesPagePath,
  loadPluginsPage,
  loadInstalledPluginsPage,
  loadTemplatesPage,
  getTemplateLink,
  initiatePluginAction,
  performPluginAction,
  provePluginInstalled,
  provePluginUninstalled,
  provePluginUpdated,
  provePluginInstalledOldVersion,
  provePluginTemplatesInstalled,
  provePluginTemplatesUninstalled,
  failAction
}
