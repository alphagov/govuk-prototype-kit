// npm dependencies
const { capitalize } = require('lodash')
const { urlencode } = require('nunjucks/src/filters')
const { waitForApplication } = require('../utils')

const manageTemplatesPagePath = '/manage-prototype/templates'
const managePluginsPagePath = '/manage-prototype/plugins'

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

async function loadTemplatesPage () {
  cy.task('log', 'Visit the manage prototype templates page')
  await waitForApplication(manageTemplatesPagePath)
}

function performPluginAction (action, plugin, pluginName) {
  cy.task('log', `The ${plugin} plugin should be displayed`)
  cy.get('h2')
    .contains(pluginName)

  cy.task('log', `The ${plugin} plugin is ${action === 'upgrade' ? 'upgrad' : action}ing`)

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

  cy.get(panelProcessingQuery, { timeout: 40000 })
    .should('not.be.visible')
  cy.get(panelCompleteQuery)
    .should('not.be.visible')
  cy.get(panelErrorQuery)
    .should('be.visible')

  cy.get(`${panelErrorQuery} .govuk-panel__title`)
    .contains(`There was a problem ${action === 'upgrade' ? 'Upgrad' : action}ing`)
  cy.get(`${panelErrorQuery} a`)
    .contains('Please contact support')
}

module.exports = {
  managePluginsPagePath,
  manageTemplatesPagePath,
  loadPluginsPage,
  loadTemplatesPage,
  getTemplateLink,
  performPluginAction,
  failAction
}
