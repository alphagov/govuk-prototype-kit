
const { waitForApplication } = require('../utils')
const { setUpPages, cleanUpPages } = require('./link-page-utils')

const startPath = '/start'

const howManyBalls = '3 or more'
const mostImpressiveTrick = 'Standing on my head'

describe('Question journey', async () => {
  before(() => {
    waitForApplication()
    cleanUpPages()
    setUpPages()
    waitForApplication()
  })

  after(() => {
    cleanUpPages()
  })

  it('Happy path journey', () => {
    // Visit start page and click start
    cy.task('log', 'The start page should be displayed')
    cy.visit(startPath)
    cy.get('h1').should('contains.text', 'Service name goes here')
    cy.get('a.govuk-button--start').click()

    // On Juggling balls page, click continue
    cy.task('log', 'The juggling balls page should be displayed')
    cy.get('h1').should('contains.text', 'How many balls can you juggle?')
    cy.get(`input[value="${howManyBalls}"]`).check()
    cy.get('button.govuk-button').should('contains.text', 'Continue').click()

    // On Juggling trick page, click continue
    cy.task('log', 'The juggling trick page should be displayed')
    cy.get('h1').should('contains.text', 'What is your most impressive juggling trick?')
    cy.get('textarea#most-impressive-trick').type(mostImpressiveTrick)
    cy.get('button.govuk-button').should('contains.text', 'Continue').click()

    // On Check answers page, click accept and send
    cy.task('log', 'The check answers page should be displayed')
    cy.get('h1').should('contains.text', 'Check your answers before sending your application')
    cy.get('.govuk-summary-list__value:first').should('contains.text', howManyBalls)
    cy.get('.govuk-summary-list__value:last').should('contains.text', mostImpressiveTrick)
    cy.get('button.govuk-button').should('contains.text', 'Accept and send').click()

    // Confirmation page should be displayed correctly
    cy.task('log', 'The confirmation page should be displayed')
    cy.get('h1.govuk-panel__title').should('contains.text', 'Application complete')
  })
})
