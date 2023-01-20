// local dependencies
const { waitForApplication, uninstallPlugin } = require('../../utils')

const managePluginsPagePath = '/manage-prototype/plugins'
const manageTemplatesPagePath = '/manage-prototype/templates'
const panelCompleteQuery = '[aria-live="polite"] #panel-complete'

async function loadPluginsPage () {
  cy.task('log', 'Visit the manage prototype plugins page')
  await waitForApplication(managePluginsPagePath)
}

async function loadTemplatesPage () {
  cy.task('log', 'Visit the manage prototype templates page')
  await waitForApplication(manageTemplatesPagePath)
}

async function installPluginTests ({ plugin, templates }) {
  describe(plugin, () => {
    before(() => {
      uninstallPlugin(plugin)
      cy.wait(4000)
    })

    beforeEach(() => {
      cy.wait(4000)
    })

    it(`The ${plugin} plugin templates are not available`, () => {
      loadTemplatesPage()
      cy.get(`[data-plugin-package-name="${plugin}"]`).should('not.exist')
    })

    it(`Install the ${plugin} plugin`, () => {
      loadPluginsPage()
      cy.task('log', `Install the ${plugin} plugin`)
      cy.get(`button[formaction*="/install?package=${encodeURIComponent(plugin)}"]`)
        .contains('Install').click()

      cy.get(panelCompleteQuery, { timeout: 20000 })
        .should('be.visible')
      cy.get('a').contains('Back to plugins').click()

      cy.get(`button[formaction*="/uninstall?package=${encodeURIComponent(plugin)}"]`)
        .contains('Uninstall')
    })

    it(`The ${plugin} plugin templates are available`, () => {
      loadTemplatesPage()
      cy.get(`[data-plugin-package-name="${plugin}"]`).should('exist')
    })

    templates.forEach(({ name, filename }) => {
      it(`View ${name} template`, () => {
        loadTemplatesPage()
        cy.get(`[data-plugin-package-name="${plugin}"] a`).contains(`View ${name} page`).click()
        cy.url().then(url => expect(url).to.contain(filename))
      })
    })

    it(`Uninstall the ${plugin} plugin`, () => {
      loadPluginsPage()
      cy.task('log', `Uninstall the ${plugin} plugin`)
      cy.get(`button[formaction*="/uninstall?package=${encodeURIComponent(plugin)}"]`)
        .contains('Uninstall').click()

      cy.get(panelCompleteQuery, { timeout: 20000 })
        .should('be.visible')
      cy.get('a').contains('Back to plugins').click()

      cy.get(`button[formaction*="/install?package=${encodeURIComponent(plugin)}"]`)
        .contains('Install')
    })
  })
}

describe('Plugin tests', () => {
  installPluginTests({
    plugin: '@govuk-prototype-kit/common-templates',
    templates: [
      { name: 'Blank GOV.UK', filename: 'blank-govuk.html' },
      { name: 'Blank unbranded', filename: 'blank-unbranded.html' },
      { name: 'Check answers', filename: 'check-answers.html' },
      { name: 'Confirmation', filename: 'confirmation.html' },
      { name: 'Content', filename: 'content.html' },
      { name: 'Mainstream guide', filename: 'mainstream-guide.html' },
      { name: 'Start', filename: 'start.html' },
      { name: 'Question', filename: 'question.html' }
    ]
  })
})
