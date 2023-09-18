const { performPluginAction, managePrototypeContextPath } = require('../plugin-utils')
const { uninstallPlugin, restoreStarterFiles, waitForApplication } = require('../../utils')

const plugin = 'govuk-frontend'
const pluginName = 'GOV.UK Frontend'
const dependentPlugin = '@govuk-prototype-kit/common-templates'
const pluginListUrl = `${managePrototypeContextPath}/plugins`
const pluginPageUrl = `${managePrototypeContextPath}/plugin/npm:${plugin}`

describe('Manage prototype pages without govuk-frontend', () => {
  afterEach(restoreStarterFiles)

  it('Uninstall govuk-frontend', () => {
    cy.task('addToConfigJson', { allowGovukFrontendUninstall: true })

    uninstallPlugin(dependentPlugin)

    cy.task('waitUntilAppRestarts')
    cy.visit(`${pluginPageUrl}/uninstall`)

    cy.get('#plugin-action-button').contains('Uninstall').click()

    performPluginAction('uninstall', plugin, pluginName)

    cy.task('log', 'Make sure govuk-frontend is uninstalled')

    waitForApplication(pluginListUrl)

    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('.plugin-details-link')
      .contains(pluginName)
      .click()

    cy.get('.govuk-prototype-kit-plugin-install-button', { timeout: 3000 })
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
      .find('.plugin-details-link')
      .contains(pluginName)
      .click()

    cy.get('.govuk-prototype-kit-plugin-install-button', { timeout: 6000 })
      .click()

    performPluginAction('install', plugin, pluginName)

    cy.task('log', 'Make sure govuk-frontend is installed')

    waitForApplication(pluginListUrl)

    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('.govuk-prototype-kit-installed')
      .contains('Installed')
  })
})
