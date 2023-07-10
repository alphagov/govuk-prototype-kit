
// local dependencies
const { waitForApplication, restoreStarterFiles } = require('../../utils')
const { setUpPages, setUpBranchingPages } = require('./link-page-utils')

const jugglingBallsPath = '/juggling-balls'

const eligibleHowManyBalls = '3 or more'
const ineligibleHowManyBalls = '1 or 2'

describe('Branching journey', async () => {
  before(() => {
    setUpPages()
    setUpBranchingPages()
    waitForApplication()
  })

  after(restoreStarterFiles)

  it('eligible journey', () => {
    // Visit Juggling balls page, click continue
    cy.visit(jugglingBallsPath)
    cy.task('log', 'The juggling balls page should be displayed')
    cy.get('h1').contains('How many balls can you juggle?')
    cy.get(`input[value="${eligibleHowManyBalls}"]`).check()
    cy.get('button.govuk-button').contains('Continue').click()

    // Juggling trick page should be displayed correctly
    cy.task('log', 'The juggling trick page should be displayed')
    cy.get('h1').contains('What is your most impressive juggling trick?')
  })

  it('Ineligible journey', () => {
    // Visit Juggling balls page, click continue
    cy.visit(jugglingBallsPath)
    cy.task('log', 'The juggling balls page should be displayed')
    cy.get('h1').contains('How many balls can you juggle?')
    cy.get(`input[value="${ineligibleHowManyBalls}"]`).check()
    cy.get('button.govuk-button').contains('Continue').click()

    // Juggling trick page should be displayed correctly
    cy.task('log', 'The juggling trick page should be displayed')
    cy.get('h1').contains('Sorry, you are ineligible for juggling tricks')
  })
})
