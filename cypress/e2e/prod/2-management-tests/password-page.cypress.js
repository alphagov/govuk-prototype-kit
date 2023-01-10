const path = require('path')

const homePath = '/index'
const passwordPath = '/manage-prototype/password'
const errorQuery = 'error=wrong-password'
const returnURLQuery = `returnURL=${encodeURIComponent(homePath)}`

async function getAuthToken () {
  const filename = path.join(Cypress.env('projectFolder'), 'app', 'config.json')
  return cy.task('retrieveAuthToken', { filename })
}

describe('password page', () => {
  before(() => {
    cy.task('waitUntilAppRestarts')
  })

  it('valid password', () => {
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
    cy.visit(homePath)
    cy.url().then(passwordUrl => {
      const urlObject = new URL(passwordUrl)
      expect(passwordUrl).equal(`${urlObject.origin + passwordPath}?${returnURLQuery}`)
      cy.get('input#password').type('invalid')
      cy.get('form').submit()
      cy.get('.govuk-error-summary__list').should('contains.text', 'The password is not correct')
      cy.get('#password-error').should('contains.text', 'The password is not correct')
      cy.url().should('eq', `${urlObject.origin + passwordPath}?${errorQuery}&${returnURLQuery}`)
    })
  })

  it('valid token', () => {
    getAuthToken().then(authToken => {
      cy.visit(homePath + `?loginToken=${encodeURIComponent(authToken)}`)
      cy.url().then(homeUrl => {
        const urlObject = new URL(homeUrl)
        expect(homeUrl).equal(`${urlObject.origin + homePath}`)
      })
    })
  })

  it('invalid token', () => {
    getAuthToken().then(authToken => {
      cy.visit(homePath + `?loginToken=${encodeURIComponent(authToken + 'x')}`)
      cy.url().then(passwordUrl => {
        const urlObject = new URL(passwordUrl)
        expect(passwordUrl).equal(`${urlObject.origin + passwordPath}?${returnURLQuery}`)
      })
    })
  })
})
