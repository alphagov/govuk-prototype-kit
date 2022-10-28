const { waitForApplication, uninstallPlugin, installPlugin } = require('../../utils')
const managePluginsPagePath = '/manage-prototype/plugins'
const plugin = '@govuk-prototype-kit/step-by-step'
const version1 = '@1.0.0'
const version2 = '@2.0.0'
const pluginName = 'Step By Step'

const cleanup = () => {
  // Make sure plugin version 1 is installed
  installPlugin(plugin, version1)
  cy.wait(5000)
}

describe('Management plugins: ', () => {
  before(() => {
    cy.task('log', 'Visit the manage prototype plugins page')
    cleanup()
    waitForApplication(managePluginsPagePath)
  })

  after(() => {
    cleanup()
  })

  it(`Make sure ${plugin}${version1} is installed and it can be upgraded to ${plugin}${version2} and then uninstalled`, () => {
    cy.task('log', `Make sure ${plugin}${version1} is installed and it can be upgraded to ${plugin}${version2} and then uninstalled`)
    cy.get(`a[href*="/uninstall?package=${encodeURIComponent(plugin)}"]`)
      .should('contains.text', 'Uninstall')
    cy.get(`a[href*="/install?package=${encodeURIComponent(plugin)}&mode=upgrade"]`)
      .should('contains.text', 'Upgrade')
  })

  it(`Upgrade the ${plugin} plugin to ${plugin}${version2}`, () => {
    cy.task('log', `Upgrade the ${plugin} plugin`)
    cy.get(`a[href*="/install?package=${encodeURIComponent(plugin)}&mode=upgrade"]`)
      .should('contains.text', 'Upgrade').click()

    cy.task('log', `The ${plugin} plugin should be displayed`)
    cy.get('h1')
      .should('contains.text', `Upgrade ${pluginName}`)

    cy.get('code').eq(0)
      .should('have.text', `npm install ${plugin}${version2}`)

    installPlugin(plugin, version2)

    cy.wait(10000)

    waitForApplication(managePluginsPagePath)

    cy.task('log', `Uninstall the ${plugin}${version2} plugin`)
    cy.get(`a[href*="/uninstall?package=${encodeURIComponent(plugin)}"]`)
      .should('contains.text', 'Uninstall').click()

    cy.task('log', `The ${plugin} plugin should be displayed`)
    cy.get('h1')
      .should('contains.text', `Uninstall ${pluginName}`)

    cy.get('code').eq(0)
      .should('have.text', `npm uninstall ${plugin}`)

    uninstallPlugin(plugin)

    cy.wait(5000)

    waitForApplication(managePluginsPagePath)

    cy.task('log', `Install the ${plugin} plugin`)
    cy.get(`a[href*="/install?package=${encodeURIComponent(plugin)}"]`)
      .should('contains.text', 'Install')
  })
})
