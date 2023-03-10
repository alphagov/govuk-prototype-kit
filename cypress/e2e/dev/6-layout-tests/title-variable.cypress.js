// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication } = require('../../utils')

const indexFile = path.join('app', 'views', 'index.html')

before(() => {
  cy.task('copyFromStarterFiles', { filename: indexFile })
})

it('should allow title to be set in multiple ways', () => {
  waitForApplication()
  cy.visit('/')

  cy.title().should('eq', 'Home - Service name goes here - GOV.UK Prototype Kit')

  cy.task('createFile', {
    filename: path.join(Cypress.env('projectFolder'), indexFile),
    data: `
    {% extends "layouts/main.html" %}

    {% set title="This is my custom title" %}`,
    replace: true
  })

  cy.visit('/')

  cy.title().should('eq', 'This is my custom title - Service name goes here - GOV.UK Prototype Kit')

  cy.task('createFile', {
    filename: path.join(Cypress.env('projectFolder'), indexFile),
    data: `
    {% extends "layouts/main.html" %}

    {% set title="This is my custom title" %}
    {% set titleOrganisation="GOV.UK" %}`,
    replace: true
  })

  cy.visit('/')

  cy.title().should('eq', 'This is my custom title - Service name goes here - GOV.UK')

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

  cy.title().should('eq', 'This is my override title')
})
