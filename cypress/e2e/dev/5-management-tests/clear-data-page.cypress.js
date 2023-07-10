
// core dependencies
const path = require('path')

// local dependencies
const {
  copyFile,
  createFile,
  replaceInFile,
  waitForApplication,
  restoreStarterFiles
} = require('../../utils')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const templates = path.join(Cypress.config('fixturesFolder'), 'views')
const components = path.join(Cypress.config('fixturesFolder'), 'components')

const questionComponent = path.join(components, 'juggling-trick-component.html')
const questionTemplate = path.join(templates, 'question.html')

const questionView = path.join(appViews, 'question.html')
const questionCheckView = path.join(appViews, 'question-check.html')

const questionTestMarkUp = `
{% extends "govuk-prototype-kit/layouts/govuk-branded.html" %}

{% block content %}

<h1 class="govuk-heading-xl">question results</h1>

<div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
    <p>Answer: <span id="answer">{{ data['most-impressive-trick'] }}</span></p>
    </div>
</div>
    
{% endblock %}
`

function clearData () {
  cy.get('footer a[href*="/manage-prototype/clear-data"]').click()
  cy.get('h1').should('contain.text', 'Clear session data')
  cy.get('button').should('contain.text', 'Clear the data').click()
  cy.get('main h1').should('contain.text', 'Data cleared')
  cy.get('main a').should('contain.text', 'Prototype home page').click()
}

const answer = 'Standing on my head'

describe('clear data page', () => {
  after(restoreStarterFiles)
  before(() => {
    copyFile(questionTemplate, questionView)
    replaceInFile(questionView, '<p>[Insert question content here]</p>', questionComponent)
    replaceInFile(questionView, '/url/of/next/page', '', '/question-check')
    createFile(questionCheckView, { data: questionTestMarkUp })
    cy.task('copyFromStarterFiles', { filename: 'app/data/session-data-defaults.js' })
  })

  it('save and clear data', () => {
    waitForApplication()

    cy.task('log', 'Check data is cleared initially')
    cy.visit('/index')
    clearData()
    cy.visit('/question-check')
    cy.get('#answer').should('have.text', '')

    cy.task('log', 'Add some data')
    cy.visit('/question')
    cy.get('form textarea').type(answer)
    cy.get('form').submit()

    cy.task('log', 'Check data has been saved')
    cy.get('#answer').should('contain.text', answer)
    cy.visit('/question')
    cy.get('form textarea').should('contain.value', answer)

    cy.task('log', 'Check data can be cleared')
    cy.visit('/index')
    clearData()
    cy.visit('/question-check')
    cy.get('#answer').should('have.text', '')
  })
})
