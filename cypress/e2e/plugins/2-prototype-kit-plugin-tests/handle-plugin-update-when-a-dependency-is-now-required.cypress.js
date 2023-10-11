import path from 'path'

import {
  installPlugin,
  restoreStarterFiles,
  uninstallPlugin,
  waitForApplication
} from '../../utils'

import {
  initiatePluginAction,
  provePluginInstalled,
  provePluginUninstalled
} from '../plugin-utils'

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

    provePluginUninstalled(dependencyPlugin)

    initiatePluginAction('update', plugin, null, {
      confirmation: () => {
        cy.get('#plugin-action-confirmation')
          .find('ul')
          .contains(dependencyPluginName)

        cy.get('#plugin-action-button').click()
      }
    })

    provePluginInstalled(plugin)
    provePluginInstalled(dependencyPlugin, dependencyPluginName)
  })
})
