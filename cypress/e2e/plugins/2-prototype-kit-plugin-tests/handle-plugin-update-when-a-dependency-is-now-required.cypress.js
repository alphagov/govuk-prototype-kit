import { installPlugin, restoreStarterFiles, uninstallPlugin, waitForApplication } from '../../utils'
import path from 'path'

const plugin = '@govuk-prototype-kit/common-templates'
const pluginVersion = '1.1.1'
const pluginsPage = '/manage-prototype/plugins'

const dependencyPlugin = 'govuk-frontend'
const dependencyPluginName = 'GOV.UK Frontend'

const additionalScssPath = path.join(Cypress.env('projectFolder'), 'app', 'assets', 'sass', 'settings.scss')
const additionalScssContents = `
@mixin govuk-text-colour {
  color: black;
}
@mixin govuk-font($size, $weight: regular, $tabular: false, $line-height: false) {
  font-size: $size
}
@mixin govuk-media-query($from) {
  @media (min-width: $from) { @content; }
}`

describe('Handle a plugin update', () => {
  after(restoreStarterFiles)

  it('when a dependency is now required', () => {
    cy.task('createFile', { filename: additionalScssPath, data: additionalScssContents })
    installPlugin(plugin, pluginVersion)
    uninstallPlugin(dependencyPlugin)

    waitForApplication(pluginsPage)

    cy.get('[data-plugin-group-status="search"]')
      .find(`[data-plugin-package-name="${dependencyPlugin}"]`)
      .find('.plugin-details-link')
      .contains(dependencyPluginName)
      .click()

    cy.get('.govuk-prototype-kit-plugin-install-button', { timeout: 4000 })
      .contains('Install')

    waitForApplication(pluginsPage)

    cy.get('#installed-plugins-link').click()

    cy.get('[data-plugin-group-status="installed"]')
      .find(`[data-plugin-package-name="${plugin}"]`)
      .find('.plugin-details-link')
      .click()

    cy.get('.govuk-prototype-kit-plugin-update-button', { timeout: 4000 })
      .contains('Update')
      .click()

    cy.get('#dependency-heading', { timeout: 4000 })
      .find('ul')
      .contains(dependencyPluginName)

    cy.get('#plugin-action-button').click()

    cy.get('#panel-complete', { timeout: 20000 })
      .should('be.visible')
      .contains('Update complete')

    cy.get('#instructions-complete a')
      .contains('Back to plugin details')
      .click()

    cy.get('.govuk-back-link', { timeout: 5000 })
      .contains('Back to plugins')
      .click()

    cy.get('#installed-plugins-link').click()

    cy.get('[data-plugin-group-status="installed"]')
      .find(`[data-plugin-package-name="${dependencyPlugin}"]`)

    cy.get('[data-plugin-group-status="installed"]')
      .find(`[data-plugin-package-name="${plugin}"]`)
  })
})
