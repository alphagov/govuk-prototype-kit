import { installPlugin, uninstallPlugin, waitForApplication } from '../../utils'

const plugin = '@govuk-prototype-kit/common-templates'
const pluginVersion = '1.1.1'
const pluginsPage = '/manage-prototype/plugins'

const dependencyPlugin = 'govuk-frontend'
const dependencyPluginName = 'GOV.UK Frontend'

describe('Handle a plugin update', () => {
  it('when a dependency is now required', () => {
    installPlugin(plugin, pluginVersion)
    uninstallPlugin(dependencyPlugin)

    waitForApplication(pluginsPage)

    cy.get('[data-plugin-group-status="available"]')
      .find(`[data-plugin-package-name="${dependencyPlugin}"]`)
      .find('button')
      .contains('Install')

    cy.get('[data-plugin-group-status="installed"]')
      .find(`[data-plugin-package-name="${plugin}"]`)
      .find('button')
      .contains('Update')
      .click()

    cy.get('#plugin-action-confirmation')
      .find('ul')
      .contains(dependencyPluginName)

    cy.get('#plugin-action-button').click()

    cy.get('#panel-complete', { timeout: 20000 })
      .should('be.visible')
      .contains('Update complete')

    cy.get('#instructions-complete a')
      .contains('Back to plugins')
      .click()

    cy.get('[data-plugin-group-status="installed"]')
      .find(`[data-plugin-package-name="${dependencyPlugin}"]`)

    cy.get('[data-plugin-group-status="installed"]')
      .find(`[data-plugin-package-name="${plugin}"]`)
  })
})
