const { waitForApplication } = require('../utils')
const path = require('path')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const extensionFooView = path.join(appViews, 'extension-foo.html')

const YELLOW = 'rgb(255, 255, 0)'
const BLUE = 'rgb(0, 0, 255)'

const extensionFooViewMarkup = `
{% extends "layout.html" %}

{% block content %}
{% include "foo.njk" %}
{% endblock %}

{% block pageScripts %}
<script>
  window.GOVUKPrototypeKit.documentReady(function () {
    new window.FOO.Modules.ExtensionFoo('.test-foo')
  })
</script>
{% endblock %}
`

describe(`${name} journey`, async () => {
  before(() => {
    waitForApplication()
    cy.task('createFile', { filename: extensionFooView, data: extensionFooViewMarkup })
  })

  after(() => {
    // clean up
    cy.task('deleteFile', { filename: extensionFooView })
  })

  it('Loads extension-foo view correctly', () => {
    cy.visit('/extension-foo')
    cy.get('.extension-foo')
      .should('contains.text', 'Extension Foo')
  })

  it('Loads extension-foo style correctly', () => {
    cy.visit('/extension-foo')
    cy.get('.extension-foo')
      .should('have.css', 'background-color', YELLOW)
  })

  it('Loads extension-foo script correctly', () => {
    cy.visit('/extension-foo')
    cy.get('.extension-foo').click()
    cy.get('.extension-foo').should('have.css', 'background-color', BLUE)
  })
})
