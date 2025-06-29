const {
  managePluginsPagePath,
  performPluginAction,
  provePluginInstalled,
  provePluginUninstalled,
  initiatePluginAction
} = require('../plugin-utils')
const { uninstallPlugin, restoreStarterFiles } = require('../../utils')

const plugin = 'govuk-frontend'
const pluginName = 'GOV.UK Frontend'
const dependentPlugin = '@govuk-prototype-kit/common-templates'

describe('Manage prototype pages without govuk-frontend', () => {
  afterEach(restoreStarterFiles)

  it('Uninstall govuk-frontend', () => {
    cy.task('addToConfigJson', { allowGovukFrontendUninstall: true })

    uninstallPlugin(dependentPlugin)

    cy.task('waitUntilAppRestarts')
    cy.visit(`${managePluginsPagePath}/uninstall?package=${plugin}`)

    cy.get('#plugin-action-button').contains('Uninstall').click()

    performPluginAction('uninstall', plugin, pluginName)

    cy.task('log', 'Make sure govuk-frontend is uninstalled')

    provePluginUninstalled(plugin)

    cy.task('log', 'Test home page')
    cy.get('a').contains('Manage your prototype').click()
    cy.get('h1').contains('Manage your prototype')

    cy.task('log', 'Test templates page')
    cy.get('a').contains('Templates').click()
    cy.get('h1').contains('Templates')

    cy.task('log', 'Test plugins page')
    cy.get('a').contains('Plugins').click()
    cy.get('h1').contains('Plugins')

    cy.task('log', `Install the ${plugin} plugin`)

    initiatePluginAction('install', plugin, pluginName)

    cy.task('log', 'Make sure govuk-frontend is installed')

    provePluginInstalled(plugin, pluginName)
  })
})
