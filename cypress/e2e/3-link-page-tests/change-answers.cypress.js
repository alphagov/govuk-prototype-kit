
const { waitForApplication } = require('../utils')
const { setUpPages, setUpData, cleanUpPages, clearUpData } = require('./link-page-utils')

const checkAnswersPath = '/check-answers'

const howManyBalls = '3 or more'
const mostImpressiveTrick = 'Standing on my head'

const defaultHowManyBalls = 'None - I cannot juggle'
const defaultMostImpressiveTrick = 'None - I cannot do tricks'

describe('Change answers', async () => {
  before(() => {
    waitForApplication()
    cleanUpPages()
    setUpPages()
    setUpData()
    waitForApplication()
  })

  after(() => {
    clearUpData()
    cleanUpPages()
  })

  it('Change juggling balls journey', () => {
    // Visit Check answers page, click change juggling balls
    cy.task('log', 'The check answers page should be displayed')
    cy.visit(checkAnswersPath)
    cy.get('h1').should('contains.text', 'Check your answers before sending your application')
    cy.get('.govuk-summary-list__value:first').should('contains.text', defaultHowManyBalls)
    cy.get('.govuk-summary-list__value:last').should('contains.text', defaultMostImpressiveTrick)
    cy.get('a[href="/juggling-balls"]').should('contains.text', 'Change').click()

    // On Juggling balls page, click continue
    cy.task('log', 'The juggling balls page should be displayed')
    cy.get('h1').should('contains.text', 'How many balls can you juggle?')
    cy.get(`input[value="${defaultHowManyBalls}"]`).should('be.checked')
    cy.get(`input[value="${howManyBalls}"]`).check()
    cy.get('button.govuk-button').should('contains.text', 'Continue').click()

    // On Juggling trick page, click continue
    cy.task('log', 'The juggling trick page should be displayed')
    cy.get('h1').should('contains.text', 'What is your most impressive juggling trick?')
    cy.get('textarea#most-impressive-trick').should('contains.text', defaultMostImpressiveTrick)
    cy.get('button.govuk-button').should('contains.text', 'Continue').click()

    // On Check answers page, click accept and send
    cy.task('log', 'The check answers page should be displayed')
    cy.get('h1').should('contains.text', 'Check your answers before sending your application')
    cy.get('.govuk-summary-list__value:first').should('contains.text', howManyBalls)
    cy.get('.govuk-summary-list__value:last').should('contains.text', defaultMostImpressiveTrick)
  })

  it('Change juggling trick journey', () => {
    // Visit Check answers page, click change juggling trick
    cy.task('log', 'The check answers page should be displayed')
    cy.visit(checkAnswersPath)
    cy.get('h1').should('contains.text', 'Check your answers before sending your application')
    cy.get('.govuk-summary-list__value:first').should('contains.text', defaultHowManyBalls)
    cy.get('.govuk-summary-list__value:last').should('contains.text', defaultMostImpressiveTrick)
    cy.get('a[href="/juggling-trick"]').should('contains.text', 'Change').click()

    // On Juggling trick page, click continue
    cy.task('log', 'The juggling trick page should be displayed')
    cy.get('h1').should('contains.text', 'What is your most impressive juggling trick?')
    cy.get('textarea#most-impressive-trick').should('contains.text', defaultMostImpressiveTrick).type(mostImpressiveTrick)
    cy.get('button.govuk-button').should('contains.text', 'Continue').click()

    // On Check answers page, click accept and send
    cy.task('log', 'The check answers page should be displayed')
    cy.get('h1').should('contains.text', 'Check your answers before sending your application')
    cy.get('.govuk-summary-list__value:first').should('contains.text', defaultHowManyBalls)
    cy.get('.govuk-summary-list__value:last').should('contains.text', mostImpressiveTrick)
  })
})
