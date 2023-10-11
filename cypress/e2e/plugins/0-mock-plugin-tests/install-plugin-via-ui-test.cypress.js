const { restoreStarterFiles, log } = require('../../utils')
const path = require('path')
const {
  loadTemplatesPage,
  managePluginsPagePath,
  performPluginAction,
  initiatePluginAction,
  provePluginInstalled,
  provePluginTemplatesInstalled,
  provePluginTemplatesUninstalled
} = require('../plugin-utils')

const panelCompleteQuery = '[aria-live="polite"] #panel-complete'
const fixtures = path.join(Cypress.config('fixturesFolder'))
const dependentPlugin = 'plugin-fee'
const dependentPluginName = 'Plugin Fee'
const dependentPluginLocation = [fixtures, 'plugins', dependentPlugin].join(Cypress.config('pathSeparator'))
const dependencyPlugin = 'govuk-frontend'
const dependencyPluginName = 'GOV.UK Frontend'

describe('Install and uninstall Local Plugin via UI Test', async () => {
  afterEach(restoreStarterFiles)

  it(`The ${dependentPlugin} plugin will be installed`, () => {
    log(`The ${dependentPlugin} plugin templates are not available`)
    loadTemplatesPage()
    provePluginTemplatesUninstalled(dependentPlugin)

    //   ------------------------

    log(`Install the ${dependentPlugin} plugin`)
    cy.task('waitUntilAppRestarts')
    cy.visit(`${managePluginsPagePath}/install?package=${encodeURIComponent(dependentPlugin)}&version=${encodeURIComponent(dependentPluginLocation)}`)
    cy.get('#plugin-action-button').click()

    cy.get(panelCompleteQuery, { timeout: 20000 })
      .should('be.visible')
    cy.get('a').contains('Back to plugins').click()

    provePluginInstalled(dependentPlugin, dependentPluginName)

    //   ------------------------

    log(`The ${dependentPlugin} plugin templates are available`)
    cy.get('a').contains('Templates').click()
    provePluginTemplatesInstalled(dependentPlugin)

    //   ------------------------

    log('Uninstall the local plugin')
    cy.get('a').contains('Plugins').click()

    initiatePluginAction('uninstall', dependentPlugin, dependentPluginName)

    //   ------------------------

    log(`The ${dependentPlugin} plugin templates are not available`)
    cy.get('a').contains('Templates').click()
    provePluginTemplatesUninstalled(dependentPlugin)
  })

  it(`The ${dependentPlugin} plugin and ${dependencyPlugin} will be installed`, () => {
    log(`The ${dependentPlugin} plugin templates are not available`)
    loadTemplatesPage()
    provePluginTemplatesUninstalled(dependentPlugin)

    //   ------------------------

    log(`Uninstall the ${dependencyPlugin} to force the UI to ask for it later`)
    cy.task('waitUntilAppRestarts')
    cy.visit(`${managePluginsPagePath}/uninstall?package=${encodeURIComponent(dependencyPlugin)}`)
    cy.get('#plugin-action-button').click()
    performPluginAction('uninstall', dependencyPlugin, dependencyPluginName)

    //   ------------------------

    log(`Install the ${dependentPlugin} plugin and the ${dependencyPlugin}`)
    cy.task('waitUntilAppRestarts')
    cy.visit(`${managePluginsPagePath}/install?package=${encodeURIComponent(dependentPlugin)}&version=${encodeURIComponent(dependentPluginLocation)}`)
    // Should list the dependency plugin
    cy.get('li').contains(dependencyPluginName)
    cy.get('#plugin-action-button').click()
    performPluginAction('install', dependentPlugin, dependentPluginName)

    //   ------------------------

    log(`The ${dependentPlugin} plugin templates are available`)
    cy.get('a').contains('Templates').click()
    provePluginTemplatesInstalled(dependentPlugin)

    //   ------------------------

    log('Uninstall the dependency plugin')
    cy.task('waitUntilAppRestarts')
    cy.visit(`${managePluginsPagePath}/uninstall?package=${encodeURIComponent(dependencyPlugin)}`)
    // Should list the dependent plugin
    cy.get('li').contains(dependentPluginName)
    cy.get('#plugin-action-button').click()
    performPluginAction('uninstall', dependencyPlugin, dependencyPluginName)

    //   ------------------------

    log(`The ${dependentPlugin} plugin templates are not available`)
    cy.get('a').contains('Templates').click()
    provePluginTemplatesUninstalled(dependentPlugin)
  })
})
