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

async function installPluginTests ({ plugin, templates, version }) {
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
      if (version) {
        cy.visit(`${managePluginsPagePath}/install?package=${encodeURIComponent(plugin)}&version=${version}`)

        cy.get('#plugin-action-button').click()
      } else {
        loadPluginsPage()
        cy.task('log', `Install the ${plugin} plugin`)
        cy.get(`[data-plugin-package-name="${plugin}"] button`).contains('Install').click()
      }

      cy.get(panelCompleteQuery, { timeout: 20000 })
        .should('be.visible')
      cy.get('a').contains('Back to plugins').click()

      cy.get(`[data-plugin-package-name="${plugin}"] button`).contains('Uninstall')
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
      cy.get(`[data-plugin-package-name="${plugin}"] button`).contains('Uninstall').click()

      cy.get(panelCompleteQuery, { timeout: 20000 })
        .should('be.visible')
      cy.get('a').contains('Back to plugins').click()

      cy.get(`[data-plugin-package-name="${plugin}"] button`).contains('Install')
    })
  })
}

describe('Plugin tests', () => {
  installPluginTests({
    plugin: '@govuk-prototype-kit/common-templates',
    version: '1.0.0',
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
