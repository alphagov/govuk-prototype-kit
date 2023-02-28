const path = require('path')
const { waitForApplication } = require('../../utils')

const appGlobalsPath = path.join(Cypress.env('projectFolder'), 'app', 'globals.js')
const appFiltersViewPath = path.join(Cypress.env('projectFolder'), 'app', 'views', 'globals.html')

const globalsViewMarkup = `
{% extends "layouts/main.html" %}
{% block content %}
<div id="test-foo-emphasize-global-function">{{ fooEmphasize('def') }}</div>
{% endblock %}
`
const globalsAddition = `
addGlobal('fooEmphasize', (content) => '<em>' + content + '</em>', { renderAsHtml: true })
`
describe('Globals Test', () => {
  before(() => {
    // Restore globals file from prototype starter
    cy.task('copyFromStarterFiles', { filename: path.join('app', 'globals.js') })
    cy.task('appendFile', { filename: appGlobalsPath, data: globalsAddition })
    cy.task('createFile', { filename: appFiltersViewPath, data: globalsViewMarkup })
  })

  it('view the globals html file', () => {
    waitForApplication('/globals')
    cy.get('#test-foo-emphasize-global-function')
      .should('have.html', '<em>def</em>')
  })
})
