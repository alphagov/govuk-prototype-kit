const fs = require('fs')
const path = require('path')

const homePath = '/index'
const passwordPath = '/manage-prototype/password'
const errorQuery = 'error=wrong-password'
const returnURLQuery = `returnURL=${encodeURIComponent(homePath)}`

describe('password page', () => {
  let authToken
  before(() => {
    cy.task('waitUntilAppRestarts')
    authToken = JSON.parse(fs.readFileSync(path.join(Cypress.env('projectFolder'), 'app', 'config.json'), 'utf8')).authToken
    console.log('auth token', authToken)
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
    cy.visit(homePath + `?loginToken=${encodeURIComponent(authToken)}`)
    cy.url().then(homeUrl => {
      const urlObject = new URL(homeUrl)
      expect(homeUrl).equal(`${urlObject.origin + homePath}`)
    })
  })

  it('invalid token', () => {
    cy.visit(homePath + `?loginToken=${encodeURIComponent(authToken.substr(0, -1))}`)
    cy.url().then(passwordUrl => {
      const urlObject = new URL(passwordUrl)
      expect(passwordUrl).equal(`${urlObject.origin + passwordPath}?${returnURLQuery}`)
    })
  })
})
