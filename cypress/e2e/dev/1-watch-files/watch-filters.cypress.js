const path = require('path')
const { waitForApplication, restoreStarterFiles } = require('../../utils')

const appFiltersPath = path.join(Cypress.env('projectFolder'), 'app', 'filters.js')
const appFiltersViewPath = path.join(Cypress.env('projectFolder'), 'app', 'views', 'filters.html')

const filtersViewMarkup = `
{% extends "layouts/main.html" %}
{% block content %}
<div id="test-foo-strong-filter">{{ 'abc' | foo__strong }}</div>
{% endblock %}
`
const filtersAddition = `
const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
addFilter('foo__strong', (content) => '<strong>' + content + '</strong>', { renderAsHtml: true })
`
describe('Filters Test', () => {
  beforeEach(() => {
    // Restore filters file from prototype starter
    cy.task('createFile', { filename: appFiltersPath, data: filtersAddition })
    cy.task('createFile', { filename: appFiltersViewPath, data: filtersViewMarkup })
  })

  afterEach(restoreStarterFiles)

  it('view the filters html file', () => {
    waitForApplication('/filters')
    cy.get('#test-foo-strong-filter')
      .should('have.html', '<strong>abc</strong>')
  })
})
