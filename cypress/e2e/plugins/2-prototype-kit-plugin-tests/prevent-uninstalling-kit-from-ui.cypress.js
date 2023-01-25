// local dependencies
import { failAction, managePluginsPagePath } from '../plugin-utils'

const plugin = 'govuk-prototype-kit'
const pluginName = 'GOV.UK Prototype Kit'

describe('Prevent uninstalling kit from ui', () => {
  it('Should fail', () => {
    cy.visit(`${managePluginsPagePath}/uninstall?package=${plugin}`)
    cy.get('h2')
      .should('contains.text', `Uninstall ${pluginName}`)
    failAction('uninstall')
  })
})
