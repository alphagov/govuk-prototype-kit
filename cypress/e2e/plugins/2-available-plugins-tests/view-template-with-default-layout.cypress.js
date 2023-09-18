// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, installPlugin, restoreStarterFiles } = require('../../utils')
const { manageTemplatesPagePath, getTemplateLink } = require('../plugin-utils')

const plugin = '@govuk-prototype-kit/step-by-step'
const pluginPageTemplate = '/templates/step-by-step-navigation.html'
const pluginPageTitle = 'Step by step navigation'

const defaultLayoutFilePath = path.join('app', 'views', 'layouts', 'main.html')
const backupLayoutComment = '<!-- could not find layouts/main.html or layouts/main.njk in prototype, using backup default template -->'

const comments = el => cy.wrap(
  [...el.childNodes]
    .filter(node => node.nodeName === '#comment')
    .map(commentNode => '<!--' + commentNode.data + '-->')
)

describe('view template with default layout', () => {
  beforeEach(() => {
    installPlugin(plugin, 'latest')
  })

  afterEach(restoreStarterFiles)

  it('deleting default layout does not cause viewing a template to fail to render', () => {
    cy.task('log', 'Visit the manage prototype plugins page')

    waitForApplication(manageTemplatesPagePath)
    cy.visit(manageTemplatesPagePath)

    cy.task('log', `Preview the ${pluginPageTitle} template`)

    cy.get(`a[href="${getTemplateLink('view', '@govuk-prototype-kit/step-by-step', pluginPageTemplate)}"]`).click()

    cy.document().then(doc =>
      comments(doc.head).should('not.contain', backupLayoutComment)
    )

    cy.task('deleteFile', { filename: path.join(Cypress.env('projectFolder'), defaultLayoutFilePath) })

    waitForApplication(manageTemplatesPagePath)
    cy.visit(manageTemplatesPagePath)

    cy.task('log', `Preview the ${pluginPageTitle} template`)

    cy.get(`a[href="${getTemplateLink('view', '@govuk-prototype-kit/step-by-step', pluginPageTemplate)}"]`).click()

    cy.visit('/', { failOnStatusCode: false })
    cy.get('body').should('not.contains.text', 'Error: template not found')

    cy.document().then(doc => {
      cy.log('head content', doc.head.innerHTML)
      comments(doc.head).should('contain', backupLayoutComment)
    })
  })
})
