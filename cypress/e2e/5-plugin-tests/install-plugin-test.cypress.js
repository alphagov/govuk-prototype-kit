const { waitForApplication, installPlugin, uninstallPlugin, deleteFile, createFile } = require('../../utils')
const path = require('path')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const pluginBazView = path.join(appViews, 'plugin-baz.html')
const fixtures = path.join(Cypress.config('fixturesFolder'))
const pluginLocation = path.join(fixtures, 'plugins', 'plugin-baz')
const pluginPackageJson = path.join(pluginLocation, 'package.json')

const CYAN = 'rgb(0, 255, 255)'
const MAGENTA = 'rgb(255, 0, 255)'

const pluginBazViewMarkup = `
{% extends "layouts/main.html" %}

{% block content %}
{% include "baz.njk" %}
{% endblock %}

{% block pageScripts %}
<script>
  window.GOVUKPrototypeKit.documentReady(() => {
    new window.BAZ.Modules.PluginBaz('.test-baz')
  })
</script>
{% endblock %}
`

const cleanup = () => {
  deleteFile(pluginBazView)
  uninstallPlugin('plugin-baz')
}

describe('Single Plugin Test', async () => {
  before(() => {
    waitForApplication()
    cleanup()
    cy.task('notExistsFile', { filename: pluginPackageJson, timeout: 15000 })
    cy.wait(5000)
    createFile(pluginBazView, { data: pluginBazViewMarkup })
    cy.task('createFile', { filename: pluginBazView, data: pluginBazViewMarkup })
    installPlugin(`file:${pluginLocation}`)
    cy.task('existsFile', { filename: pluginPackageJson, timeout: 15000 })
    cy.wait(5000)
  })

  after(() => {
    cleanup()
  })

  it('Loads plugin-baz view correctly', () => {
    waitForApplication('/plugin-baz')
    cy.get('.plugin-baz')
      .should('contains.text', 'Plugin Baz')
  })

  it('Loads plugin-baz style correctly', () => {
    waitForApplication('/plugin-baz')
    cy.get('.plugin-baz')
      .should('have.css', 'background-color', MAGENTA)
      .should('have.css', 'border-color', CYAN)
  })

  it('Loads plugin-baz script correctly', () => {
    waitForApplication('/plugin-baz')
    cy.get('.plugin-baz').click()
    cy.get('.plugin-baz')
      .should('have.css', 'background-color', CYAN)
      .should('have.css', 'border-color', MAGENTA)
  })
})
