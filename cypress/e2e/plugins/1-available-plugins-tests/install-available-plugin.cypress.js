// core dependencies
const path = require('path')

// local dependencies
const { deleteFile, uninstallPlugin, installPlugin, restoreStarterFiles, log } = require('../../utils')
const {
  failAction,
  performPluginAction,
  managePluginsPagePath,
  getTemplateLink,
  loadInstalledPluginsPage,
  loadPluginsPage,
  manageInstalledPluginsPagePath
} = require('../plugin-utils')
const { showHideAllLinkQuery, assertVisible, assertHidden } = require('../../step-by-step-utils')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const plugin = '@govuk-prototype-kit/step-by-step'
const version1 = '1.0.0'
const version2 = 'latest'
const pluginName = 'Step By Step'
const pluginPageTemplate = '/templates/step-by-step-navigation.html'
const pluginPageTitle = 'Step by step navigation'
const pluginPagePath = '/step-by-step-navigation'

const provePluginFunctionalityWorks = () => {
  log(`Prove ${pluginName} functionality works`)

  cy.visit(pluginPagePath)

  // click toggle button and check that all steps details are visible
  cy.get(showHideAllLinkQuery).contains('Show all').click()
  assertVisible(1)
  assertVisible(2)

  // click toggle button and check that all steps details are hidden
  cy.get(showHideAllLinkQuery).contains('Hide all').click()
  assertHidden(1)
  assertHidden(2)
}

const provePluginFunctionalityFails = () => {
  cy.on('uncaught:exception', (err) => {
    console.log(err)
    // returning false here prevents Cypress from
    // failing a test when javascript in the browser fails
    return false
  })

  log(`Prove ${pluginName} functionality fails`)

  cy.visit(pluginPagePath)

  cy.get(showHideAllLinkQuery).should('not.exist')
}

describe('Management plugins: ', () => {
  afterEach(restoreStarterFiles)

  it('CSRF Protection on POST action', () => {
    // Load the plugins page, so we don't get any network errors when running the test
    loadPluginsPage()
    // Now run the test
    const installUrl = `${managePluginsPagePath}/install`
    log(`Posting to ${installUrl} without csrf protection`)
    cy.request({
      url: `${managePluginsPagePath}/install`,
      method: 'POST',
      failOnStatusCode: false,
      body: { package: plugin }
    }).then(response => {
      expect(response.status).to.eq(403)
      expect(response.body).to.have.property('error', 'invalid csrf token')
    })
  })

  it(`Update the ${plugin} plugin`, () => {
    log(`Install ${plugin}@${version1} directly`)
    uninstallPlugin(plugin)

    loadPluginsPage()

    cy.visit(`${managePluginsPagePath}/install?package=${encodeURIComponent(plugin)}&version=${version1}`)

    cy.get('#plugin-action-button').click()

    performPluginAction('install', plugin, pluginName)

    //   ------------------------

    log(`Update the ${plugin}@${version1} plugin to ${plugin}@${version2}`)
    installPlugin(plugin, version1)

    loadInstalledPluginsPage()
    log(`Update the ${plugin} plugin`)

    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('button')
      .contains('Update')
      .click()

    performPluginAction('update', plugin, pluginName)
  })

  it(`Create a page using a template from the ${plugin} plugin`, () => {
    log('Install the plugin, create the page, and test the functionality')
    deleteFile(path.join(appViews, 'step-by-step-navigation.html'))
    installPlugin(plugin, version2)

    loadInstalledPluginsPage()
    cy.get('a[href*="/templates"]')
      .contains('Templates').click()

    cy.get('h2').contains(pluginName)

    //   ------------------------

    log(`Create a new ${pluginPageTitle} page`)

    cy.get(`a[href="${getTemplateLink('install', '@govuk-prototype-kit/step-by-step', pluginPageTemplate)}"]`).click()

    // create step-by-step-navigation page
    cy.get('.govuk-heading-l')
      .contains(`Create new ${pluginPageTitle} page`)
    cy.get('#chosen-url')
      .type(pluginPagePath)
    cy.get('.govuk-button').contains('Create page').click()

    provePluginFunctionalityWorks()

    //   ------------------------

    log(`Uninstall the ${plugin} plugin`)

    cy.visit(manageInstalledPluginsPagePath)

    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('button')
      .contains('Uninstall')
      .click()

    performPluginAction('uninstall', plugin, pluginName)

    provePluginFunctionalityFails()

    //   ------------------------

    log(`Reinstall the ${plugin} plugin`)

    cy.visit(managePluginsPagePath)

    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('button')
      .contains('Install')
      .click()

    performPluginAction('install', plugin, pluginName)

    provePluginFunctionalityWorks()
  })

  it('Get plugin page directly', () => {
    log('Pass when installing a plugin already installed')
    cy.task('waitUntilAppRestarts')
    log(`Simulate refreshing the install ${plugin} plugin confirmation page`)
    cy.visit(`${managePluginsPagePath}/install?package=${encodeURIComponent(plugin)}`)

    cy.get('#plugin-action-button').click()

    performPluginAction('install', plugin, pluginName)

    //   ------------------------

    log('Fail when installing a non existent plugin')
    const pkg = 'invalid-prototype-kit-plugin'
    const invalidPluginName = 'Invalid Prototype Kit Plugin'
    cy.visit(`${managePluginsPagePath}/install?package=${encodeURIComponent(pkg)}`)
    cy.get('h2').contains(`Install ${invalidPluginName}`)
    failAction('install')

    //   ------------------------

    log('Fail when installing a plugin with a non existent version')
    cy.visit(`${managePluginsPagePath}/install?package=${encodeURIComponent(plugin)}&version=0.0.1`)
    cy.get('h2').contains(`Install ${pluginName}`)
    failAction('install')
  })
})
