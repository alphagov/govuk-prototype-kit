
// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, restoreStarterFiles } = require('../../utils')

const templatesView = path.join(Cypress.config('fixturesFolder'), 'views', 'checkbox-test.html')
const appView = path.join(Cypress.env('projectFolder'), 'app', 'views', 'checkbox-test.html')

const pagePath = '/checkbox-test'

describe('checkbox tests', () => {
  before(() => {
    cy.task('log', `Copy ${templatesView} to ${appView}`)
    cy.task('copyFile', { source: templatesView, target: appView })
  })

  after(restoreStarterFiles)

  const loadTestView = async () => {
    cy.task('log', 'The checkbox-test page should be displayed')
    cy.visit(pagePath)
    cy.get('h1')
      .contains('Checkbox tests')
  }

  const submitAndCheck = async (matchData) => {
    cy.intercept('POST', pagePath).as('submitPage')
    cy.get('button[data-module="govuk-button"]')
      .contains('Continue')
      .click()
    cy.wait('@submitPage').its('request.body')
      .then((body) => {
        const data = decodeURIComponent(body).split('&')
        cy.expect(data.length).equal(matchData.length)
        matchData.forEach((match) => {
          cy.expect(data).includes(match)
        })
      })
  }

  it('request should include the _unchecked option only', () => {
    waitForApplication()
    loadTestView()
    submitAndCheck(['vehicle1[vehicle-features]=_unchecked'])
  })

  it('when the GPS checkbox is selected, the request should include the GPS option', () => {
    waitForApplication()
    loadTestView()
    cy.get('input[value="GPS"]').check()
    submitAndCheck(['vehicle1[vehicle-features]=_unchecked', 'vehicle1[vehicle-features]=GPS'])
  })
})
