// npm dependencies
const { capitalize } = require('lodash')
const { urlencode } = require('nunjucks/src/filters')
const { waitForApplication } = require('../utils')

const managePrototypeContextPath = '/manage-prototype'
const manageTemplatesPagePath = `${managePrototypeContextPath}/templates`
const managePluginsPagePath = `${managePrototypeContextPath}/plugins`
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

function performPluginAction (action, plugin, pluginName) {
  cy.task('log', `The ${plugin} plugin should be displayed`)
  cy.get('h1')
    .contains(pluginName)

  const processingText = `${action === 'update' ? 'Updat' : action}ing ...`

  if (Cypress.env('skipPluginActionInterimStep') !== 'true') {
    cy.get(panelCompleteQuery, { timeout: 20000 })
      .should('not.be.visible')
    cy.get(panelCompleteQuery)
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

  const expectedButtonContents = action === 'uninstall' ? 'Back to plugins' : 'Back to plugin details'

  cy.get('#instructions-complete a')
    .contains(expectedButtonContents)
}

module.exports = {
  managePluginsPagePath,
  manageInstalledPluginsPagePath,
  manageTemplatesPagePath,
  managePrototypeContextPath,
  loadPluginsPage,
  loadInstalledPluginsPage,
  loadTemplatesPage,
  getTemplateLink,
  performPluginAction
}
