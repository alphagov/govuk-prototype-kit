const homePath = '/index'
const passwordPath = '/manage-prototype/password'
const errorQuery = 'error=wrong-password'
const returnURLQuery = `returnURL=${encodeURIComponent(homePath)}`

describe('password page', () => {
  it('valid password', () => {
    cy.task('waitUntilAppRestarts')
    cy.visit(homePath)
    cy.url().then(passwordUrl => {
      const urlObject = new URL(passwordUrl)
      expect(passwordUrl).equal(`${urlObject.origin + passwordPath}?${returnURLQuery}`)
      cy.get('input#password').type(Cypress.env('password'))
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
})
