const { waitForApplication } = require('../../utils')
const path = require('path')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const extensionFooBarView = path.join(appViews, 'extension-foo-bar.html')

const WHITE = 'rgb(255, 255, 255)'
const RED = 'rgb(255, 0, 0)'
const YELLOW = 'rgb(255, 255, 0)'
const BLUE = 'rgb(0, 0, 255)'

const extensionFooBarCombinedViewMarkup = `
{% extends "layout.html" %}

{% block content %}
{% set testVar="Hello" %}
<h1 class="test-foo test-bar">Extension Foo Bar</h1>
<p id="filter-test-foo">{{testVar | foo__strong}}</p>
<p id="filter-test-bar">{{testVar | bar__link('https://gov.uk/')}}</p>
{% endblock %}

{% block pageScripts %}
<script>
  window.GOVUKPrototypeKit.documentReady(function () {
    new window.BAR.Modules.ExtensionBar('.test-bar')
    new window.FOO.Modules.ExtensionFoo('.test-foo')
  })
</script>
{% endblock %}
`

describe('Multiple Extension test', async () => {
  before(() => {
    waitForApplication()
    cy.task('createFile', { filename: extensionFooBarView, data: extensionFooBarCombinedViewMarkup })
  })

  after(() => {
    // clean up
    cy.task('deleteFile', { filename: extensionFooBarView })
  })

  describe('Extension Bar', () => {
    it('Loads extension-bar view correctly', () => {
      cy.visit('/extension-foo-bar')
      cy.get('.extension-bar')
        .should('contains.text', 'Extension Foo Bar')
    })

    it('Loads extension-bar style correctly', () => {
      cy.visit('/extension-foo-bar')
      cy.get('.extension-bar')
        .should('have.css', 'background-color', YELLOW)
        .should('have.css', 'border-color', WHITE)
    })

    it('Loads extension-bar script correctly', () => {
      cy.visit('/extension-foo-bar')
      cy.get('.extension-bar').click()
      cy.get('.extension-bar')
        .should('have.css', 'background-color', BLUE)
        .should('have.css', 'border-color', RED)
    })
    it('Uses the foo filter correctly', () => {
      cy.visit('/extension-foo-bar')
      cy.get('#filter-test-bar')
        .should('contain.html', '<a href="https://gov.uk/">Hello</a>')
    })
  })

  describe('Extension Foo', () => {
    it('Loads extension-foo view correctly', () => {
      cy.visit('/extension-foo-bar')
      cy.get('.extension-foo')
        .should('contains.text', 'Extension Foo Bar')
    })

    it('Loads extension-foo style correctly', () => {
      cy.visit('/extension-foo-bar')
      cy.get('.extension-foo')
        .should('have.css', 'background-color', YELLOW)
        .should('have.css', 'border-color', WHITE)
    })

    it('Loads extension-foo script correctly', () => {
      cy.visit('/extension-foo-bar')
      cy.get('.extension-foo').click()
      cy.get('.extension-foo').should('have.css', 'background-color', BLUE)
        .should('have.css', 'border-color', RED)
    })
    it('Uses the bar filter correctly', () => {
      cy.visit('/extension-foo-bar')
      cy.get('#filter-test-foo')
        .should('contain.html', '<strong>Hello</strong>')
    })
  })
})
