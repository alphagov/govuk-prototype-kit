const path = require('path')

const { waitForApplication } = require('../utils')

const templatesView = path.join(Cypress.config('fixturesFolder'), 'views', 'checkbox-test.html')
const appView = path.join(Cypress.env('projectFolder'), 'app', 'views', 'checkbox-test.html')

const pagePath = '/checkbox-test'

describe('checkbox tests', () => {
  before(() => {
    waitForApplication()

    // load test view
    cy.task('deleteFile', { filename: appView })
    cy.task('log', `Copy ${templatesView} to ${appView}`)
    cy.task('copyFile', { source: templatesView, target: appView })
    cy.task('log', 'The checkbox-test page should be displayed')
    cy.visit(pagePath)
    cy.get('h1')
      .should('contains.text', 'Checkbox tests')
  })

  after(() => {
    waitForApplication()
    cy.task('deleteFile', { filename: appView })
  })

  const submitAndCheck = async (matchData) => {
    cy.intercept('POST', pagePath).as('submitPage')
    cy.get('button[data-module="govuk-button"]')
      .should('contains.text', 'Continue')
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
    submitAndCheck(['vehicle1[vehicle-features]=_unchecked'])
  })

  it('when the GPS checkbox is selected, the request should include the GPS option', () => {
    cy.get('input[value="GPS"]').check()
    submitAndCheck(['vehicle1[vehicle-features]=_unchecked', 'vehicle1[vehicle-features]=GPS'])
  })
})
