const { waitForApplication, installPlugin, getTemplateLink, deleteFile } = require('../../utils')
const { capitalize } = require('lodash')
const path = require('path')
const { showHideAllLinkQuery, assertVisible, assertHidden } = require('../../step-by-step-utils')
const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const managePluginsPagePath = '/manage-prototype/plugins'
const manageTemplatesPagePath = '/manage-prototype/templates'
const plugin = '@govuk-prototype-kit/step-by-step'
const version1 = '@1.0.0'
const version2 = '@2.1.0'
const pluginName = 'Step By Step'
const pluginPageTemplate = '/templates/step-by-step-navigation.html'
const pluginPageTitle = 'Step by step navigation'
const pluginPagePath = '/step-by-step-navigation'

const cleanup = () => {
  deleteFile(path.join(appViews, 'step-by-step-navigation.html'))
  // Make sure plugin version 1 is installed
  installPlugin(plugin, version1)
  cy.wait(5000)
}

const getVerbAction = (action) => {
  switch (action) {
    case 'upgrade': return 'Upgrading'
    case 'install': return 'Installing'
    case 'uninstall': return 'Uninstalling'
  }
}

const performPluginAction = (action, version = '') => {
  cy.task('log', `The ${plugin} plugin should be displayed`)
  cy.get('h1')
    .should('contains.text', `${capitalize(action)} ${pluginName}`)

  cy.get('code').eq(0)
    .should('have.text', `npm ${action === 'upgrade' ? 'install' : action} ${plugin}${version}`)

  cy.get('button.govuk-button')
    .should('contains.text', `${capitalize(action)} ${pluginName}`).click()

  cy.get('h1').should('contain.text', `${getVerbAction(action)} ${pluginName}`)

  cy.get('h1', { timeout: 20000 }).should('have.text', 'Plugins')
}

const provePluginFunctionalityWorks = () => {
  cy.task('log', `Prove ${pluginName} functionality works`)

  cy.visit(pluginPagePath)

  // click toggle button and check that all steps details are visible
  cy.get(showHideAllLinkQuery).should('contains.text', 'Show all').click()
  assertVisible(1)
  assertVisible(2)

  // click toggle button and check that all steps details are hidden
  cy.get(showHideAllLinkQuery).should('contains.text', 'Hide all').click()
  assertHidden(1)
  assertHidden(2)
}

const provePluginFunctionalityFails = () => {
  cy.task('log', `Prove ${pluginName} functionality works`)

  cy.visit(pluginPagePath)

  cy.get(showHideAllLinkQuery).should('not.exist')
}

describe('Management plugins: ', () => {
  before(() => {
    cleanup()
    cy.task('log', 'Visit the manage prototype plugins page')
    waitForApplication(managePluginsPagePath)
  })

  after(() => {
    cleanup()
  })

  it(`Upgrade the ${plugin}${version1} plugin to ${plugin}${version2}`, () => {
    cy.task('log', `Upgrade the ${plugin} plugin`)
    cy.get(`a[href*="/install?package=${encodeURIComponent(plugin)}&mode=upgrade"]`)
      .should('contains.text', 'Upgrade').click()

    performPluginAction('upgrade', version2)
  })

  it(`Create a page using a template from the ${plugin} plugin`, () => {
    cy.visit(manageTemplatesPagePath)

    cy.get('h2').eq(2).should('contain.text', pluginName)

    cy.task('log', `Create a new ${pluginPageTitle} page`)

    cy.get(`a[href="${getTemplateLink('install', '@govuk-prototype-kit/step-by-step', pluginPageTemplate)}"]`).click()

    // create step-by-step-navigation page
    cy.get('.govuk-heading-l')
      .should('contains.text', `Create new ${pluginPageTitle} page`)
    cy.get('#chosen-url')
      .type(pluginPagePath)
    cy.get('.govuk-button')
      .should('contains.text', 'Create page').click()

    provePluginFunctionalityWorks()
  })

  it(`Uninstall the ${plugin} plugin`, () => {
    cy.visit(managePluginsPagePath)
    cy.task('log', `Uninstall the ${plugin} plugin`)
    cy.get(`a[href*="/uninstall?package=${encodeURIComponent(plugin)}"]`)
      .should('contains.text', 'Uninstall').click()

    performPluginAction('uninstall')

    provePluginFunctionalityFails()
  })

  it(`Install the ${plugin} plugin`, () => {
    cy.visit(managePluginsPagePath)
    cy.task('log', `Install the ${plugin} plugin`)
    cy.get(`a[href*="/install?package=${encodeURIComponent(plugin)}"]`)
      .should('contains.text', 'Install').click()

    performPluginAction('install')

    provePluginFunctionalityWorks()
  })
})
