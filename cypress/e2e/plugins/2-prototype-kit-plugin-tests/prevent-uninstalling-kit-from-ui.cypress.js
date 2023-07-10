// local dependencies
const { failAction, managePluginsPagePath } = require('../plugin-utils')
const { restoreStarterFiles } = require('../../utils')

const plugin = 'govuk-prototype-kit'
const pluginName = 'GOV.UK Prototype Kit'

describe('Prevent uninstalling kit from ui', () => {
  afterEach(restoreStarterFiles)

  it('Should fail', () => {
    cy.task('waitUntilAppRestarts')
    cy.visit(`${managePluginsPagePath}/uninstall?package=${plugin}`)
    cy.get('h2')
      .should('contains.text', `Uninstall ${pluginName}`)
    failAction('uninstall')
  })
})
