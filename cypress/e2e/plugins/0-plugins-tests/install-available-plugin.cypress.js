const { waitForApplication, installPlugin, getTemplateLink, deleteFile } = require('../../utils')
const { capitalize } = require('lodash')
const path = require('path')
const { showHideAllLinkQuery, assertVisible, assertHidden } = require('../../step-by-step-utils')
const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const managePluginsPagePath = '/manage-prototype/plugins'
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
  cy.wait(8000)
}

const panelProcessingQuery = '[aria-live="polite"] #panel-processing'
const panelCompleteQuery = '[aria-live="polite"] #panel-complete'
const panelErrorQuery = '[aria-live="polite"] #panel-error'

const performPluginAction = (action) => {
  cy.task('log', `The ${plugin} plugin should be displayed`)
  cy.get('h2')
    .should('contains.text', `${capitalize(action)} ${pluginName}`)

  cy.get(panelCompleteQuery)
    .should('not.be.visible')
  cy.get(panelCompleteQuery)
    .should('not.be.visible')
  cy.get(panelErrorQuery)
    .should('not.be.visible')
  cy.get(panelProcessingQuery)
    .should('be.visible')
    .should('contain.text', `${capitalize(action === 'upgrade' ? 'Upgrad' : action)}ing ...`)

  cy.get(panelProcessingQuery, { timeout: 20000 })
    .should('not.be.visible')
  cy.get(panelErrorQuery)
    .should('not.be.visible')
  cy.get(panelCompleteQuery)
    .should('be.visible')
    .should('contain.text', `${capitalize(action)} complete`)

  cy.get('#instructions-complete a')
    .should('contain.text', 'Back to plugins')
    .wait(3000)
    .click()

  cy.get('h1').should('have.text', 'Plugins')
}

const provePluginFunctionalityWorks = () => {
  cy.wait(2000)

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
  cy.on('uncaught:exception', (err, runnable) => {
    console.log(err)
    // returning false here prevents Cypress from
    // failing a test when javascript in the browser fails
    return false
  })

  cy.wait(2000)

  cy.task('log', `Prove ${pluginName} functionality fails`)

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

  beforeEach(() => {
    cy.wait(4000)
  })

  it('CSRF Protection on POST action', () => {
    const installUrl = `${managePluginsPagePath}/install`
    cy.task('log', `Posting to ${installUrl} without csrf protection`)
    cy.request({
      url: `${managePluginsPagePath}/install`,
      method: 'POST',
      failOnStatusCode: false,
      body: { package: plugin }
    }).then(response => {
      expect(response.status).to.eq(403)
      expect(response.body).to.eq('invalid csrf token')
    })
  })

  it(`Upgrade the ${plugin}${version1} plugin to ${plugin}${version2}`, () => {
    cy.task('log', `Upgrade the ${plugin} plugin`)
    cy.get(`button[formaction*="/upgrade?package=${encodeURIComponent(plugin)}"]`)
      .should('contains.text', 'Upgrade').click()

    performPluginAction('upgrade', version2)
  })

  it(`Create a page using a template from the ${plugin} plugin`, () => {
    cy.get('a[href*="/templates"]')
      .should('contains.text', 'Templates').click()

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
    cy.get(`button[formaction*="/uninstall?package=${encodeURIComponent(plugin)}"]`)
      .should('contains.text', 'Uninstall').click()

    performPluginAction('uninstall')

    provePluginFunctionalityFails()
  })

  it(`Install the ${plugin} plugin`, () => {
    cy.visit(managePluginsPagePath)
    cy.task('log', `Install the ${plugin} plugin`)
    cy.get(`button[formaction*="/install?package=${encodeURIComponent(plugin)}"]`)
      .should('contains.text', 'Install').click()

    performPluginAction('install')

    provePluginFunctionalityWorks()
  })

  describe('Get plugin page directly', () => {
    it('Pass when installing a plugin already installed', () => {
      cy.task('log', `Simulate refreshing the install ${plugin} plugin confirmation page`)
      cy.visit(`${managePluginsPagePath}/install?package=${encodeURIComponent(plugin)}`)

      cy.get('#plugin-action-button').click()

      performPluginAction('install')
    })

    it('Fail when installing a non existent plugin', () => {
      const pkg = 'invalid-prototype-kit-plugin'
      const pluginName = 'Invalid Prototype Kit Plugin'
      cy.visit(`${managePluginsPagePath}/install?package=${encodeURIComponent(pkg)}`)
      cy.get('h2')
        .should('contains.text', `Install ${pluginName}`)

      cy.get('#plugin-action-button').click()

      cy.get(panelCompleteQuery)
        .should('not.be.visible')
      cy.get(panelErrorQuery)
        .should('not.be.visible')
      cy.get(panelProcessingQuery)
        .should('be.visible')
        .should('contain.text', 'Installing ...')

      cy.get(panelProcessingQuery, { timeout: 40000 })
        .should('not.be.visible')
      cy.get(panelCompleteQuery)
        .should('not.be.visible')
      cy.get(panelErrorQuery)
        .should('be.visible')

      cy.get(`${panelErrorQuery} .govuk-panel__title`)
        .should('contain.text', 'There was a problem installing')
      cy.get(`${panelErrorQuery} a`)
        .should('contain.text', 'Please contact support')
    })
  })
})
