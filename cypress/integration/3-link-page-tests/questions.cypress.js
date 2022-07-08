const path = require('path')

const { waitForApplication } = require('../utils')

const templates = path.join(Cypress.env('packageFolder') || Cypress.env('projectFolder'), 'docs', 'views', 'templates')
const startTemplate = path.join(templates, 'start.html')
const questionTemplate = path.join(templates, 'question.html')
const confirmationTemplate = path.join(templates, 'confirmation.html')

const fixtureViews = path.join(Cypress.config('fixturesFolder'), 'views')
const jugglingCheckAnswersFixtureView = path.join(fixtureViews, 'juggling-check-answers.html')

const components = path.join(fixtureViews, 'components')
const jugglingBallsComponent = path.join(components, 'juggling-balls-component.html')
const jugglingTrickComponent = path.join(components, 'juggling-trick-component.html')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const startView = path.join(appViews, 'start.html')
const jugglingBallsView = path.join(appViews, 'juggling-balls.html')
const jugglingTrickView = path.join(appViews, 'juggling-trick.html')
const checkAnswersView = path.join(appViews, 'check-answers.html')
const confirmationView = path.join(appViews, 'confirmation.html')

const appDataFile = path.join(Cypress.env('projectFolder'), 'app', 'data', 'session-data-defaults.js')

const startPath = '/start'
const jugglingBallsPath = '/juggling-balls'
const jugglingTrickPath = '/juggling-trick'
const checkAnswersPath = '/check-answers'

const howManyBalls = '3 or more'
const mostImpressiveTrick = 'Standing on my head'

const defaultHowManyBalls = 'None - I cannot juggle'
const defaultMostImpressiveTrick = 'None - I cannot do tricks'

describe('Question journey', async () => {
  const cleanup = () => {
    cy.task('deleteFile', { filename: startView })
    cy.task('deleteFile', { filename: jugglingBallsView })
    cy.task('deleteFile', { filename: jugglingTrickView })
    cy.task('deleteFile', { filename: checkAnswersView })
    cy.task('deleteFile', { filename: confirmationView })
  }

  const copyFile = (source, target) => {
    cy.task('log', `Copy ${source} to ${target}`)
    cy.task('copyFile', { source, target })
  }

  const createQuestionView = (view, content, nextPath) => {
    copyFile(questionTemplate, view)
    cy.task('replaceTextInFile', { filename: view, originalText: '<h1 class="govuk-heading-xl">Heading or question goes here</h1>', newText: '' })
    cy.task('replaceTextInFile', { filename: view, originalText: '<p>[See <a href="https://design-system.service.gov.uk">the GOV.UK Design System</a> for examples]</p>', newText: '' })
    cy.task('replaceTextInFile', { filename: view, originalText: '<p>[Insert question content here]</p>', source: content })
    cy.task('replaceTextInFile', { filename: view, originalText: '/url/of/next/page', newText: nextPath })
  }

  const setUpPages = () => {
    // Set up start view
    copyFile(startTemplate, startView)
    cy.task('replaceTextInFile', { filename: startView, originalText: '<a href="#" role="button"', newText: `<a href="${jugglingBallsPath}" role="button"` })

    // Set up juggling balls view
    createQuestionView(jugglingBallsView, jugglingBallsComponent, jugglingTrickPath)

    // Set up juggling trick view
    createQuestionView(jugglingTrickView, jugglingTrickComponent, checkAnswersPath)

    // Set up check answers view
    copyFile(jugglingCheckAnswersFixtureView, checkAnswersView)

    // Set up confirmation view
    copyFile(confirmationTemplate, confirmationView)
  }

  const setUpData = () => {
    cy.task('replaceTextInFile', { filename: appDataFile, originalText: '// Insert values here', newText: `"how-many-balls": "${defaultHowManyBalls}", "most-impressive-trick": "${defaultMostImpressiveTrick}"` })
  }

  const clearUpData = () => {
    cy.task('replaceTextInFile', { filename: appDataFile, originalText: `"how-many-balls": "${defaultHowManyBalls}", "most-impressive-trick": "${defaultMostImpressiveTrick}"`, newText: '// Insert values here' })
  }

  before(() => {
    waitForApplication()
    cleanup()
    setUpPages()
  })

  after(() => {
    // cleanup()
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

  describe('Change', async () => {
    before(() => {
      setUpData()
    })

    after(() => {
      clearUpData()
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
})
