const { managePluginsPagePath, performPluginAction } = require('../plugin-utils')
const { uninstallPlugin, installPlugin, restoreStarterFiles } = require('../../utils')

const plugin = 'govuk-frontend'
const pluginName = 'GOV.UK Frontend'
const dependentPlugin = '@govuk-prototype-kit/common-templates'

describe('Manage prototype pages without govuk-frontend', () => {
  beforeEach(() => {
    cy.task('addToConfigJson', { allowGovukFrontendUninstall: true })
  })

  afterEach(restoreStarterFiles)

  it('Uninstall govuk-frontend', () => {
    uninstallPlugin(dependentPlugin)

    cy.task('waitUntilAppRestarts')
    cy.visit(`${managePluginsPagePath}/uninstall?package=${plugin}`)

    cy.get('#plugin-action-button').contains('Uninstall').click()

    performPluginAction('uninstall', plugin, pluginName)

    cy.task('log', 'Make sure govuk-frontend is uninstalled')
    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .find('button')
      .contains('Install')

    cy.task('log', 'Test home page')
    cy.get('a').contains('Home').click()
    cy.get('h1').contains('Manage your prototype')

    cy.task('log', 'Test templates page')
    cy.get('a').contains('Templates').click()
    cy.get('h1').contains('Templates')

    cy.task('log', 'Test plugins page')
    cy.get('a').contains('Plugins').click()
    cy.get('h1').contains('Plugins')

    cy.task('log', `Install the ${plugin} plugin`)

    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('button')
      .contains('Install')
      .click()

    performPluginAction('install', plugin, pluginName)

    cy.task('log', 'Make sure govuk-frontend is installed')
    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .find('button')
      .contains('Uninstall')

    installPlugin(dependentPlugin)
  })
})
