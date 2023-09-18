const { replaceInFile, waitForApplication, restoreStarterFiles, log } = require('../../utils')
const path = require('path')
const plugin = '@govuk-prototype-kit/task-list'
const pluginName = 'Task List'
const pluginVersion = '1.1.1'
const originalText = '"dependencies": {'
const replacementText = `"dependencies": { "${plugin}": "${pluginVersion}",`
const pkgJsonFile = path.join(Cypress.env('projectFolder'), 'package.json')
const pluginsPage = '/manage-prototype/plugins'

describe('Handle a plugin installation mismatch', () => {
  after(restoreStarterFiles)

  it('where the prototype package.json specifies a dependency that has not been installed', () => {
    waitForApplication()
    cy.exec(`cd ${Cypress.env('projectFolder')} && npm uninstall ${plugin}`)

    log(`Add ${plugin} to the dependencies within the package.json`)
    replaceInFile(pkgJsonFile, originalText, '', replacementText)

    waitForApplication()

    log(`Make sure ${plugin} is displayed as not installed`)
    cy.visit(pluginsPage)

    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('.plugin-details-link')
      .contains(pluginName)
      .click()

    cy.get('.govuk-prototype-kit-plugin-install-button', { timeout: 4000 })
      .contains('Install')

    log('Force the plugins to be installed with an npm install')
    cy.exec(`cd ${Cypress.env('projectFolder')} && npm install`)

    log(`Make sure ${plugin} is displayed as installed`)
    waitForApplication()
    cy.visit(pluginsPage)

    cy.get('#installed-plugins-link').click()
    cy.get(`[data-plugin-package-name="${plugin}"]`)
      .scrollIntoView()
      .find('.plugin-details-link')
      .contains(pluginName)
  })
})
