const path = require('path')
const { waitForApplication, restoreStarterFiles } = require('../../utils')

const appFunctionsPath = path.join(Cypress.env('projectFolder'), 'app', 'functions.js')
const appFiltersViewPath = path.join(Cypress.env('projectFolder'), 'app', 'views', 'functions.html')

const functionsViewMarkup = `
{% extends "layouts/main.html" %}
{% block content %}
<div id="test-foo-emphasize-function">{{ fooEmphasize('def') }}</div>
{% endblock %}
`
const functionsAddition = `
const govukPrototypeKit = require('govuk-prototype-kit')
const addFunction = govukPrototypeKit.views.addFunction
addFunction('fooEmphasize', (content) => '<em>' + content + '</em>', { renderAsHtml: true })
`
describe('Functions Test', () => {
  beforeEach(() => {
    // Restore functions file from prototype starter
    cy.task('createFile', { filename: appFunctionsPath, data: functionsAddition })
    cy.task('createFile', { filename: appFiltersViewPath, data: functionsViewMarkup })
  })

  afterEach(restoreStarterFiles)

  it('view the functions html file', () => {
    waitForApplication('/functions')
    cy.get('#test-foo-emphasize-function')
      .should('have.html', '<em>def</em>')
  })
})
