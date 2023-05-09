// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication } = require('../../utils')

const indexFile = path.join('app', 'views', 'index.html')

function restore () {
  cy.task('copyFromStarterFiles', { filename: indexFile })
}

describe('title-variable', () => {
  before(restore)
  after(restore)

  it('should allow title to be set in multiple ways', () => {
    waitForApplication()
    cy.visit('/')

    cy.task('log', 'Should display standard home page title')

    cy.title().should('eq', 'Home - Service name goes here - GOV.UK')

    cy.task('log', 'Update index.html using "set pageName" to display customised page title')

    cy.task('createFile', {
      filename: path.join(Cypress.env('projectFolder'), indexFile),
      data: `
    {% extends "layouts/main.html" %}

    {% set pageName="This is my custom title" %}`,
      replace: true
    })

    cy.visit('/')

    cy.task('log', 'Should display customised page title')

    cy.title().should('eq', 'This is my custom title - Service name goes here - GOV.UK')

    cy.task('log', 'Update index.html using "block pageTitle" to display overridden page title')

    cy.task('createFile', {
      filename: path.join(Cypress.env('projectFolder'), indexFile),
      data: `
    {% extends "layouts/main.html" %}

    {% block pageTitle %}
      This is my override title
    {% endblock %}`,
      replace: true
    })

    cy.visit('/')

    cy.task('log', 'Should display overridden page title')

    cy.title().should('eq', 'This is my override title')
  })
})
