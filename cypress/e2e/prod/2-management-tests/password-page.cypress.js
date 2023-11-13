const { restoreStarterFiles, log } = require('../../utils')
const homePath = '/index'
const passwordPath = '/manage-prototype/password'
const errorQuery = 'error=wrong-password'
const returnURLQuery = `returnURL=${encodeURIComponent(homePath)}`
const additionalPasswords = Cypress.env('additionalPasswords') || []

describe('password page', () => {
  after(restoreStarterFiles)

  it('valid password', () => {
    const password = Cypress.env('password')
    cy.task('waitUntilAppRestarts')
    cy.visit(homePath)
    cy.url().then(passwordUrl => {
      const urlObject = new URL(passwordUrl)
      expect(passwordUrl).equal(`${urlObject.origin + passwordPath}?${returnURLQuery}`)
      log(`Authenticating with ${password}`)
      cy.get('input#password').type(password)
      cy.get('form').submit()
      cy.url().should('eq', urlObject.origin + homePath)
    })
  })

  it('invalid password', () => {
    cy.task('waitUntilAppRestarts')
    cy.visit(homePath)
    cy.url().then(passwordUrl => {
      const urlObject = new URL(passwordUrl)
      expect(passwordUrl).equal(`${urlObject.origin + passwordPath}?${returnURLQuery}`)
      cy.get('input#password').type('invalid')
      cy.get('form').submit()
      cy.get('.govuk-error-summary__list').contains('The password is not correct')
      cy.get('#password-error').contains('The password is not correct')
      cy.url().should('eq', `${urlObject.origin + passwordPath}?${errorQuery}&${returnURLQuery}`)
    })
  })

  additionalPasswords.map(password =>
    it(`valid additional password "${password}"`, () => {
      cy.task('waitUntilAppRestarts')
      cy.visit(homePath)
      cy.url().then(passwordUrl => {
        const urlObject = new URL(passwordUrl)
        expect(passwordUrl).equal(`${urlObject.origin + passwordPath}?${returnURLQuery}`)
        log(`Authenticating with ${password}`)
        cy.get('input#password').type(password)
        cy.get('form').submit()
        cy.url().should('eq', urlObject.origin + homePath)
      })
    })
  )
})
