const { replaceInFile, waitForApplication, restoreStarterFiles, log } = require('../../utils')
const path = require('path')
const { performPluginAction } = require('../plugin-utils')
const plugin = '@govuk-prototype-kit/task-list'
const pluginVersion = '1.1.1'
const originalText = '"dependencies": {'
const replacementText = `"dependencies": { "${plugin}": "${pluginVersion}",`
const pkgJsonFile = path.join(Cypress.env('projectFolder'), 'package.json')

describe('Allow upgrade in URLs', () => {
  after(restoreStarterFiles)

  it('When updating the old upgrade URL should still work', () => {
    waitForApplication()

    log(`Add an old version of ${plugin} within the package.json`)
    replaceInFile(pkgJsonFile, originalText, '', replacementText)
    cy.exec(`cd ${Cypress.env('projectFolder')} && npm install`)

    log('Make sure old upgrade URL still works')
    cy.visit(`/manage-prototype/plugins/upgrade?package=${encodeURIComponent(plugin)}`)
    cy.get('button#plugin-action-button')
      .contains('Update')
      .click()

    log('Force the plugins to be installed with an npm install')
    performPluginAction('update', plugin, 'Task List')
  })
})
