const { replaceInFile, waitForApplication, uninstallPlugin, log } = require('../../utils')
const path = require('path')
const plugin = '@govuk-prototype-kit/task-list'
const pluginVersion = '1.1.1'
const originalText = '"dependencies": {'
const replacementText = `"dependencies": { "${plugin}": "${pluginVersion}",`
const pkgJsonFile = path.join(Cypress.env('projectFolder'), 'package.json')
const pluginsPage = '/manage-prototype/plugins'

function restore () {
  uninstallPlugin(plugin)
}

describe('Handle a plugin installation mismatch', () => {
  before(restore)
  after(restore)

  it('where the prototype package.json specifies a dependency that has not been installed', () => {
    waitForApplication()

    log(`Add ${plugin} to the dependencies within the package.json`)
    replaceInFile(pkgJsonFile, originalText, '', replacementText)

    log(`Make sure ${plugin} is displayed as not installed`)
    cy.visit(pluginsPage)
    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('button')
      .contains('Install')

    log('Force the plugins to be installed with an npm install')
    cy.exec(`cd ${Cypress.env('projectFolder')} && npm install`)

    log(`Make sure ${plugin} is displayed as installed`)
    waitForApplication()
    cy.visit(pluginsPage)
    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('button')
      .contains('Uninstall')
  })
})
