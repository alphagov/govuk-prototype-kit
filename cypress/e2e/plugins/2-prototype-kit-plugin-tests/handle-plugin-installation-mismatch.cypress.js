const {
  replaceInFile,
  waitForApplication,
  restoreStarterFiles,
  log
} = require('../../utils')
const path = require('path')
const {
  provePluginUninstalled,
  provePluginInstalledOldVersion
} = require('../plugin-utils')
const plugin = '@govuk-prototype-kit/task-list'
const pluginVersion = '1.1.1'
const originalText = '"dependencies": {'
const replacementText = `"dependencies": { "${plugin}": "${pluginVersion}",`
const pkgJsonFile = path.join(Cypress.env('projectFolder'), 'package.json')

describe('Handle a plugin installation mismatch', () => {
  after(restoreStarterFiles)

  it('where the prototype package.json specifies a dependency that has not been installed', () => {
    waitForApplication()

    log(`Add ${plugin} to the dependencies within the package.json`)
    replaceInFile(pkgJsonFile, originalText, '', replacementText)

    log(`Make sure ${plugin} is displayed as not installed`)
    provePluginUninstalled(plugin)

    log('Force the plugins to be installed with an npm install')
    cy.exec(`cd ${Cypress.env('projectFolder')} && npm install`)

    log(`Make sure ${plugin} is displayed as installed`)
    waitForApplication()

    provePluginInstalledOldVersion(plugin)
  })
})
