
// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, installPlugin, uninstallPlugin, createFile, restoreStarterFiles } = require('../../utils')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const pluginBazView = path.join(appViews, 'plugin-baz.html')
const fixtures = path.join(Cypress.config('fixturesFolder'))
const pluginLocation = path.join(fixtures, 'plugins', 'plugin-baz')

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

describe('Install Plugin via CLI Test', async () => {
  after(restoreStarterFiles)

  before(() => {
    uninstallPlugin('plugin-baz')
    createFile(pluginBazView, { data: pluginBazViewMarkup })
    installPlugin(`file:${pluginLocation}`)
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
