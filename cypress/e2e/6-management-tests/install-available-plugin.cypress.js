const { waitForApplication } = require('../utils')
const managePluginsPagePath = '/manage-prototype/plugins'
const plugin = 'hmrc-frontend'
const pluginName = 'HMRC Frontend'

describe('install available plugin', () => {
  before(() => {
    cy.task('log', 'Visit the manage prototype plugins page')
    waitForApplication(managePluginsPagePath)
  })

  it(`Install and uninstall the ${plugin} plugin from the management plugins page`, () => {
    cy.get('h2.govuk-heading-m', { timeout: 20000 }).eq(1)
      .should('contains.text', 'Available')

    cy.task('log', `Install the ${plugin} plugin`)
    cy.get(`a[href*="/install?package=${plugin}"]`)
      .should('contains.text', 'Install').click()

    cy.task('log', `The ${plugin} plugin should be displayed`)
    cy.get('h1')
      .should('contains.text', `Install ${pluginName}`)

    cy.get('button')
      .should('contains.text', `Install ${pluginName}`).click()

    cy.get('h1')
      .should('contains.text', `Installing ${pluginName}`)

    cy.get('h2.govuk-heading-m', { timeout: 20000 }).eq(0)
      .should('contains.text', 'Installed')

    cy.task('log', `Confirm the ${plugin} plugin is installed`)
    cy.get(`a[href*="/uninstall?package=${plugin}"]`)
      .should('contains.text', 'Uninstall')

    cy.task('log', `Uninstall the ${plugin} plugin`)
    cy.get(`a[href*="/uninstall?package=${plugin}"]`)
      .should('contains.text', 'Uninstall').click()

    cy.task('log', `The ${plugin} plugin should be displayed`)
    cy.get('h1')
      .should('contains.text', `Uninstall ${pluginName}`)

    cy.get('button')
      .should('contains.text', `Uninstall ${pluginName}`).click()

    cy.get('h1')
      .should('contains.text', `Uninstalling ${pluginName}`)

    cy.get('h2.govuk-heading-m', { timeout: 20000 }).eq(1)
      .should('contains.text', 'Available')

    cy.task('log', `Confirm the ${plugin} plugin is uninstalled`)
    cy.get(`a[href*="/install?package=${plugin}"]`)
      .should('contains.text', 'Install')
  })
})
