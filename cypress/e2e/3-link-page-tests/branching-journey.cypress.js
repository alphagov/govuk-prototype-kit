
const { waitForApplication } = require('../utils')
const { setUpPages, setUpBranchingPages, cleanUpPages, cleanUpBranchingPages, backUpRoutes, restoreRoutes } = require('./link-page-utils')

const jugglingBallsPath = '/juggling-balls'

const eligibleHowManyBalls = '3 or more'
const ineligibleHowManyBalls = '1 or 2'

describe('Branching journey', async () => {
  before(() => {
    waitForApplication()
    cleanUpPages()
    cleanUpBranchingPages()
    backUpRoutes()
    setUpPages()
    setUpBranchingPages()
    waitForApplication()
  })

  after(() => {
    cleanUpPages()
    cleanUpBranchingPages()
    restoreRoutes()
  })

  it('eligible journey', () => {
    // Visit Juggling balls page, click continue
    cy.visit(jugglingBallsPath)
    cy.task('log', 'The juggling balls page should be displayed')
    cy.get('h1').should('contains.text', 'How many balls can you juggle?')
    cy.get(`input[value="${eligibleHowManyBalls}"]`).check()
    cy.get('button.govuk-button').should('contains.text', 'Continue').click()

    // Juggling trick page should be displayed correctly
    cy.task('log', 'The juggling trick page should be displayed')
    cy.get('h1').should('contains.text', 'What is your most impressive juggling trick?')
  })

  it('Ineligible journey', () => {
    // Visit Juggling balls page, click continue
    cy.visit(jugglingBallsPath)
    cy.task('log', 'The juggling balls page should be displayed')
    cy.get('h1').should('contains.text', 'How many balls can you juggle?')
    cy.get(`input[value="${ineligibleHowManyBalls}"]`).check()
    cy.get('button.govuk-button').should('contains.text', 'Continue').click()

    // Juggling trick page should be displayed correctly
    cy.task('log', 'The juggling trick page should be displayed')
    cy.get('h1').should('contains.text', 'Sorry, you are ineligible for juggling tricks')
  })
})
