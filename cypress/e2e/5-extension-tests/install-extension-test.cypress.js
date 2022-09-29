const { waitForApplication, installPlugin, uninstallPlugin, deleteFile, createFile } = require('../utils')
const path = require('path')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const extensionBazView = path.join(appViews, 'extension-baz.html')
const fixtures = path.join(Cypress.config('fixturesFolder'))
const extensionLocation = path.join(fixtures, 'extensions', 'extension-baz')

const CYAN = 'rgb(0, 255, 255)'
const MAGENTA = 'rgb(255, 0, 255)'

const extensionBazViewMarkup = `
{% extends "layout.html" %}

{% block content %}
{% include "baz.njk" %}
{% endblock %}

{% block pageScripts %}
<script>
  window.GOVUKPrototypeKit.documentReady(function () {
    new window.BAZ.Modules.ExtensionBaz('.test-baz')
  })
</script>
{% endblock %}
`

const cleanup = () => {
  deleteFile(extensionBazView)
  uninstallPlugin('extension-baz')
}

describe('Single Extension Test', async () => {
  before(() => {
    waitForApplication()
    cleanup()
    createFile(extensionBazView, {data: extensionBazViewMarkup})
    cy.task('createFile', { filename: extensionBazView, data: extensionBazViewMarkup })
    installPlugin(`file:${extensionLocation}`)
  })

  after(() => {
    cleanup()
  })

  it('Loads extension-baz view correctly', () => {
    waitForApplication('/extension-baz')
    cy.get('.extension-baz')
      .should('contains.text', 'Extension Baz')
  })

  it('Loads extension-baz style correctly', () => {
    waitForApplication('/extension-baz')
    cy.get('.extension-baz')
      .should('have.css', 'background-color', MAGENTA)
      .should('have.css', 'border-color', CYAN)
  })

  it('Loads extension-baz script correctly', () => {
    waitForApplication('/extension-baz')
    cy.get('.extension-baz').click()
    cy.get('.extension-baz')
      .should('have.css', 'background-color', CYAN)
      .should('have.css', 'border-color', MAGENTA)
  })
})
