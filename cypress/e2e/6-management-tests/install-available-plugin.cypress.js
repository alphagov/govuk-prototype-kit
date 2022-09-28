const { waitForApplication, deleteFile, copyFile } = require('../utils')
const path = require('path')
const templates = path.join(Cypress.config('fixturesFolder'), 'views')
const contentTemplate = path.join(templates, 'content.html')
const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const contentView = path.join(appViews, 'content.html')
const managePluginsPagePath = '/manage-prototype/plugins'
const contentPagePath = '/content'
const plugin = 'hmrc-frontend'
const pluginName = 'HMRC Frontend'

const pluginPackageJson = path.join(Cypress.env('projectFolder'), 'node_modules', plugin, 'package.json')

describe('install available plugin', () => {
  before(() => {
    cy.task('log', 'Visit the manage prototype plugins page')
    deleteFile(contentView)
    waitForApplication(managePluginsPagePath)
  })

  after(() => {
    deleteFile(contentView)
  })

  it(`Install and uninstall the ${plugin} plugin from the management plugins page`, () => {
    cy.get('h2.govuk-heading-m', { timeout: 20000 }).eq(1)
      .should('contains.text', 'Available')

    cy.task('log', `Install the ${plugin} plugin`)
    cy.get(`a[href*="/install?package=${plugin}"]`)
      .should('contains.text', 'Install').click()

    cy.task('log', `The ${plugin} plugin should be displayed`)
    cy.get('h1')
      .should('contains.text', `Install ${pluginName}`)

    cy.get('code')
      .should('have.text', `npm install ${plugin}`)

    cy.exec(`cd ${Cypress.env('projectFolder')} && npm install ${plugin}`)

    cy.task('existsFile', { filename: pluginPackageJson, timeout: 15000 })

    cy.wait(5000)

    cy.task('log', `Test the ${plugin} plugin in a page`)

    copyFile(contentTemplate, contentView)

    cy.task('replaceTextInFile', {
      filename: contentView,
      originalText: '{% extends "govuk-prototype-kit/layouts/govuk-branded.html" %}',
      newText: '{% extends "hmrc/layouts/account-header.html" %}'
    })

    waitForApplication(contentPagePath)

    cy.get('nav.hmrc-account-menu', { timeout: 20000 })
      .should('contains.text', 'Account menu')

    cy.visit(managePluginsPagePath)

    cy.get('h2.govuk-heading-m', { timeout: 20000 }).eq(0)
      .should('contains.text', 'Installed')

    cy.task('log', `Uninstall the ${plugin} plugin`)
    cy.get(`a[href*="/uninstall?package=${plugin}"]`)
      .should('contains.text', 'Uninstall').click()

    cy.task('log', `The ${plugin} plugin should be displayed`)
    cy.get('h1')
      .should('contains.text', `Uninstall ${pluginName}`)

    cy.get('code')
      .should('have.text', `npm uninstall ${plugin}`)

    cy.exec(`cd ${Cypress.env('projectFolder')} && npm uninstall ${plugin}`)

    cy.task('notExistsFile', { filename: pluginPackageJson, timeout: 15000 })

    cy.wait(5000)

    waitForApplication(managePluginsPagePath)

    cy.get('h2.govuk-heading-m', { timeout: 20000 }).eq(1)
      .should('contains.text', 'Available')

    cy.task('log', `Install the ${plugin} plugin`)
    cy.get(`a[href*="/install?package=${plugin}"]`)
      .should('contains.text', 'Install')
  })
})
