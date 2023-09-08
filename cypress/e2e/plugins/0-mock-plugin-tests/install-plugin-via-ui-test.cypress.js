const { restoreStarterFiles, log, waitForApplication } = require('../../utils')
const path = require('path')
const {
  loadTemplatesPage,
  performPluginAction, managePrototypeContextPath
} = require('../plugin-utils')

const panelCompleteQuery = '[aria-live="polite"] #panel-complete'
const fixtures = path.join(Cypress.config('fixturesFolder'))
const dependentPlugin = 'plugin-fee'
const dependentPluginPackageName = 'plugin-fee'
const dependentPluginName = 'Plugin Fee'
const dependentPluginLocation = [fixtures, 'plugins', dependentPlugin].join(Cypress.config('pathSeparator'))
const dependencyPlugin = 'govuk-frontend'
const dependencyPluginName = 'GOV.UK Frontend'

describe('Install and uninstall Local Plugin via UI Test', async () => {
  afterEach(restoreStarterFiles)
  beforeEach(() => () => {
    cy.exec(`cd ${Cypress.env('projectFolder')} && npm uninstall ${dependentPluginPackageName}`)
    cy.task('addToConfigJson', { allowGovukFrontendUninstall: true })
    waitForApplication()
  })

  it(`The ${dependentPlugin} plugin will be installed`, () => {
    log(`The ${dependentPlugin} plugin templates are not available`)
    loadTemplatesPage()
    cy.get(`[data-plugin-package-name="${dependentPlugin}"]`).should('not.exist')

    //   ------------------------

    log(`Install the ${dependentPlugin} plugin`)
    cy.task('waitUntilAppRestarts')
    cy.visit(`${managePrototypeContextPath}/plugin/fs:${encodeURIComponent(dependentPluginLocation)}/install`)
    cy.get('#plugin-action-button').click()

    cy.get(panelCompleteQuery, { timeout: 20000 })
      .should('be.visible')

    //   ------------------------

    log(`The ${dependentPlugin} plugin templates are available`)
    cy.get('a').contains('Templates').click()
    cy.get(`[data-plugin-package-name="${dependentPlugin}"]`).should('exist')

    //   ------------------------

    log('Uninstall the local plugin')
    cy.visit('')
    cy.visit('/manage-prototype/plugins-installed')

    cy.get(`[data-plugin-package-name="${dependentPlugin}"]`)
      .scrollIntoView()
      .find('.plugin-details-link')
      .click()

    cy.visit(`${managePrototypeContextPath}/plugin/fs:${encodeURIComponent(dependentPluginLocation)}/uninstall`)
    cy.get('#plugin-action-button').click()

    performPluginAction('uninstall', dependentPlugin, dependentPluginName)

    waitForApplication()

    //   ------------------------

    log(`The ${dependentPlugin} plugin templates are not available`)
    cy.visit('http://localhost:3000/manage-prototype/templates', { retryOnNetworkFailure: true, timeout: 4000 })
    cy.get(`[data-plugin-package-name="${dependentPlugin}"]`).should('not.exist')
  })

  it(`The ${dependentPlugin} plugin and ${dependencyPlugin} will be installed`, () => {
    cy.task('addToConfigJson', { allowGovukFrontendUninstall: true })
    log(`The ${dependentPlugin} plugin templates are not available`)
    loadTemplatesPage()
    cy.get(`[data-plugin-package-name="${dependentPlugin}"]`).should('not.exist')

    //   ------------------------

    log(`Uninstall the ${dependencyPlugin} to force the UI to ask for it later`)
    waitForApplication()
    cy.visit(`${managePrototypeContextPath}/plugin/installed:${encodeURIComponent(dependencyPlugin)}/uninstall`)
    cy.get('#plugin-action-button').click()
    performPluginAction('uninstall', dependencyPlugin, dependencyPluginName)

    //   ------------------------

    log(`Install the ${dependentPlugin} plugin and the ${dependencyPlugin}`)
    waitForApplication()
    cy.visit(`${managePrototypeContextPath}/plugin/fs:${encodeURIComponent(dependentPluginLocation)}/install`)
    // Should list the dependency plugin
    cy.get('li').contains(dependencyPluginName)
    cy.get('#plugin-action-button').click()
    performPluginAction('install', dependentPlugin, dependentPluginName)

    //   ------------------------

    log(`The ${dependentPlugin} plugin templates are available`)
    cy.get('a').contains('Templates').click()
    cy.get(`[data-plugin-package-name="${dependentPlugin}"]`).should('exist')

    //   ------------------------

    log('Uninstall the dependency plugin')
    waitForApplication()
    cy.visit(`${managePrototypeContextPath}/plugin/installed:${encodeURIComponent(dependencyPlugin)}/uninstall`)
    // Should list the dependent plugin
    cy.get('li').contains(dependentPluginName)
    cy.get('#plugin-action-button').click()
    performPluginAction('uninstall', dependencyPlugin, dependencyPluginName)

    //   ------------------------

    log(`The ${dependentPlugin} plugin templates are not available`)
    cy.get('a').contains('Templates').click()
    cy.get(`[data-plugin-package-name="${dependentPlugin}"]`).should('not.exist')
  })
})
