
// core dependencies
const path = require('path')

// local dependencies
const {
  copyFile,
  createFile,
  waitForApplication, restoreStarterFiles
} = require('../../utils')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const templates = path.join(Cypress.config('fixturesFolder'), 'views')

const questionTemplate = path.join(templates, 'question.html')

const questionView = path.join(appViews, 'question.html')
const questionCheckView = path.join(appViews, 'question-check.html')

const dataOutputNjk = `
{% extends "govuk-prototype-kit/layouts/govuk-branded.html" %}

{% block content %}
    <p>Answer: <span id="answer">{{ data['most-impressive-trick'] }}</span></p>
    <p>Should be empty: <span id="empty">{{ data['abc'] }}</span></p>
{% endblock %}
`

const answer = 'Standing on my head'

function clearData () {
  cy.get('footer a[href*="/manage-prototype/clear-data"]').click()
  cy.get('h1').should('contain.text', 'Clear session data')
  cy.get('button').should('contain.text', 'Clear the data').click()
  cy.get('main h1').should('contain.text', 'Data cleared')
  cy.get('main a').should('contain.text', 'Prototype home page').click()
}
describe('clear data page', () => {
  before(() => {
    copyFile(questionTemplate, questionView)
    createFile(questionCheckView, { data: dataOutputNjk })
    cy.task('copyFromStarterFiles', { filename: 'app/data/session-data-defaults.js' })
  })

  after(restoreStarterFiles)

  it('add data from query string, but not in magnagement pages', () => {
    waitForApplication()

    cy.task('log', 'Check data is cleared initially')
    cy.visit('/index')
    clearData()
    cy.visit('/question-check')
    cy.get('#answer').should('have.text', '')
    cy.get('#empty').should('have.text', '')

    cy.task('log', 'Add some data')
    cy.visit(`/question-check?most-impressive-trick=${encodeURIComponent(answer)}`)
    cy.get('.govuk-header__logotype-text')
    cy.visit('/manage-prototype/plugins?abc=def')
    cy.get('.govuk-header__logotype-text')

    cy.task('log', 'Check data has been saved')
    cy.visit('/question-check')
    cy.get('#answer').should('have.text', answer)
    cy.get('#empty').should('have.text', '')
  })
})
