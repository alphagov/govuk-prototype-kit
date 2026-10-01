const {
  log,
  installPlugin,
  waitForApplication,
  uninstallPlugin,
  restoreStarterFiles
} = require('../../utils')

const {
  provePluginTemplatesInstalled,
  performPluginAction,
  managePluginsPagePath,
  loadInstalledPluginsPage,
  loadPluginsPage,
  initiatePluginAction,
  provePluginUpdated
} = require('../plugin-utils')

const manageTemplatesPagePath = '/manage-prototype/templates'
const panelCompleteQuery = '[aria-live="polite"] #panel-complete'
const plugin = '@govuk-prototype-kit/common-templates'
const pluginName = 'Common Templates'
const version1 = '3.0.0'
const version2 = '3.0.1'

async function loadTemplatesPage () {
  cy.task('log', 'Visit the manage prototype templates page')
  await waitForApplication(manageTemplatesPagePath)
}

describe('Install common templates from templates page', () => {
  before(() => {
    uninstallPlugin(plugin)
  })

  after(restoreStarterFiles)

  it('install', () => {
    loadTemplatesPage()
    cy.get('a').contains('Install common templates').click()

    cy.get(panelCompleteQuery, { timeout: 20000 })
      .should('be.visible')

    cy.get('a').contains('Back to templates').click()

    provePluginTemplatesInstalled(plugin)

    cy.get('a.govuk-button').should('not.exist')
  })

  it(`Update the ${plugin} plugin`, () => {
    log(`Install ${plugin}@${version1} directly`)
    uninstallPlugin(plugin)

    loadPluginsPage()

    cy.get('#plugins-updates-available-message').should('not.exist')

    cy.visit(`${managePluginsPagePath}/install?package=${encodeURIComponent(plugin)}&version=${version1}`)

    cy.get('#plugin-action-button').click()

    performPluginAction('install', plugin, pluginName)

    cy.get('#plugins-updates-available-message').contains('1 UPDATE AVAILABLE')

    cy.get(`[data-plugin-package-name="${plugin}"]`).should('contain', version1)

    //   ------------------------

    log(`Update the ${plugin}@${version1} plugin to ${plugin}@${version2}`)
    installPlugin(plugin, version1)

    loadInstalledPluginsPage()

    log(`Update the ${plugin} plugin`)
    initiatePluginAction('update', plugin, pluginName)
    provePluginUpdated(plugin)

    cy.get('#plugins-updates-available-message').should('not.exist')
    cy.get(`[data-plugin-package-name="${plugin}"]`).should('contain', version2)
  })
})
