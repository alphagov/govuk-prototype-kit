// local dependencies
const { installPlugin, waitForApplication, restoreStarterFiles, uninstallPlugin } = require('../../utils')
const { showHideAllLinkQuery, assertVisible, assertHidden } = require('../../step-by-step-utils')
const { manageTemplatesPagePath, getTemplateLink } = require('../plugin-utils')

const plugin = '@govuk-prototype-kit/step-by-step'
const pluginName = 'Step By Step'
const pluginPageTemplate = '/templates/step-by-step-navigation.html'
const pluginPageTitle = 'Step by step navigation'

describe('Management plugins: ', () => {
  after(restoreStarterFiles)

  it(`Preview a ${plugin} template`, () => {
    cy.task('log', 'Visit the manage prototype plugins page')
    installPlugin(plugin, 'latest')
    waitForApplication(manageTemplatesPagePath)

    cy.get('h2').contains(pluginName)

    cy.task('log', `Preview the ${pluginPageTitle} template`)

    cy.get(`a[href="${getTemplateLink('view', '@govuk-prototype-kit/step-by-step', pluginPageTemplate)}"]`).click()

    cy.task('log', `Prove the ${pluginName} functionality works`)

    assertHidden(1)
    assertHidden(2)
    cy.get(showHideAllLinkQuery).contains('Show all').click()
    assertVisible(1)
    assertVisible(2)

    uninstallPlugin(plugin)
  })
})
