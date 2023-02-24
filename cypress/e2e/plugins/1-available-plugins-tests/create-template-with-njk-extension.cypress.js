// core dependencies
const path = require('path')

// local dependencies
const { loadTemplatesPage, getTemplateLink } = require('../plugin-utils')
const { deleteFile, waitForApplication } = require('../../utils')

const manageTemplatesPagePath = '/manage-prototype/templates'
const panelCompleteQuery = '[aria-live="polite"] #panel-complete'
const plugin = '@govuk-prototype-kit/common-templates'
const pluginPageTemplate = '/templates/content.html'

const appConfigPath = path.join('app', 'config.json')
const appConfig = path.join(Cypress.env('projectFolder'), appConfigPath)
const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const njkPageName = 'njk-extension-test-page'
const htmlPageName = 'html-extension-test-page'
const createdNjkPageFilename = 'app/views/njk-extension-test-page.njk'
const createdHtmlPageFilename = 'app/views/html-extension-test-page.html'

describe('create template with njk extension', () => {
  beforeEach(() => {
    deleteFile(path.join(appViews, `${njkPageName}.njk`))
    deleteFile(path.join(appViews, `${htmlPageName}.html`))
  })

  afterEach(() => {
    cy.task('mergePropertiesIntoJsonFile', { filename: appConfig, newProperties: { useNjkExtensions: null } })
    deleteFile(path.join(appViews, `${njkPageName}.njk`))
    deleteFile(path.join(appViews, `${htmlPageName}.html`))
  })

  it('create and view template', () => {
    cy.task('mergePropertiesIntoJsonFile', { filename: appConfig, newProperties: { useNjkExtensions: true } })
    loadTemplatesPage()

    cy.task('log', 'checking we can create a template page')
    cy.get(`a[href="${getTemplateLink('install', '@govuk-prototype-kit/common-templates', pluginPageTemplate)}"]`).click()
    cy.get('input').type(njkPageName)
    cy.get('button').contains('Create page').click()
    cy.get('strong').contains(createdNjkPageFilename)

    cy.task('log', 'checking we can view the page')
    cy.visit('/' + njkPageName)

    cy.task('log', 'checking that we can view the page when useNjkExtensions is removed')
    cy.task('mergePropertiesIntoJsonFile', { filename: appConfig, newProperties: { useNjkExtensions: null } })
    waitForApplication('/' + njkPageName)
  })

  it('create and view template', () => {
    loadTemplatesPage()

    cy.task('log', 'checking we can create a template page')
    cy.get(`a[href="${getTemplateLink('install', '@govuk-prototype-kit/common-templates', pluginPageTemplate)}"]`).click()
    cy.get('input').type(htmlPageName)
    cy.get('button').contains('Create page').click()
    cy.get('strong').contains(createdHtmlPageFilename)

    cy.task('log', 'checking we can view the page')
    cy.visit('/' + htmlPageName)

    cy.task('log', 'checking that we can view the page when useNjkExtensions is set to true')
    cy.task('mergePropertiesIntoJsonFile', { filename: appConfig, newProperties: { useNjkExtensions: true } })
    waitForApplication('/' + htmlPageName)
  })
})
