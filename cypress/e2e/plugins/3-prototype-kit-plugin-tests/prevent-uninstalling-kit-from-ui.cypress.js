// local dependencies
const { managePrototypeContextPath } = require('../plugin-utils')
const { restoreStarterFiles } = require('../../utils')

const plugin = 'govuk-prototype-kit'

describe('Prevent uninstalling kit from ui', () => {
  after(restoreStarterFiles)

  it('Should fail', () => {
    cy.task('waitUntilAppRestarts')
    cy.request({
      url: `${managePrototypeContextPath}/plugin/installed:${plugin}/uninstall`,
      method: 'GET',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(403)
    })
  })
})
