const { installPlugin, waitForApplication, getTemplateLink } = require('../../utils')
const { showHideAllLinkQuery, assertVisible, assertHidden } = require('../../step-by-step-utils')
const manageTemplatesPagePath = '/manage-prototype/templates'
const plugin = '@govuk-prototype-kit/step-by-step'
const version1 = '@1.0.0'
const version2 = '@2.1.0'
const pluginName = 'Step By Step'
const pluginPageTemplate = '/templates/step-by-step-navigation.html'
const pluginPageTitle = 'Step by step navigation'

describe('Management plugins: ', () => {
  before(() => {
    cy.task('log', 'Visit the manage prototype plugins page')
    installPlugin(plugin, version2)
    cy.wait(8000)
    waitForApplication(manageTemplatesPagePath)
  })

  after(() => {
    installPlugin(plugin, version1)
    cy.wait(8000)
  })

  it(`Preview a ${plugin}${version2} template`, () => {
    cy.get('h2').eq(2).should('contain.text', pluginName)

    cy.task('log', `Preview the ${pluginPageTitle} template`)

    cy.get(`a[href="${getTemplateLink('view', '@govuk-prototype-kit/step-by-step', pluginPageTemplate)}"]`).click()

    cy.task('log', `Prove the ${pluginName} functionality works`)

    assertHidden(1)
    assertHidden(2)
    cy.get(showHideAllLinkQuery).should('contains.text', 'Show all').click()
    assertVisible(1)
    assertVisible(2)
  })
})
