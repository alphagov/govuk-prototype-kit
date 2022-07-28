const path = require('path')
const { waitForApplication, copyFile, deleteFile } = require('../utils')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const indexView = path.join(appViews, 'index.html')
const startView = path.join(appViews, 'start.html')
const templateStartView = path.join(Cypress.env('packageFolder') || Cypress.env('projectFolder'), 'docs', 'views', 'templates', 'start.html')

const commentText = '<p>You can change the service name by editing the file \'/app/config.js\'.</p>'

const startText = 'Click here to start'

const linkText = `<a href="/start">${startText}</a>`

describe('Link index page to start page', async () => {
  before(() => {
    waitForApplication()
    copyFile(templateStartView, startView)
    cy.task('replaceTextInFile', {
      filename: indexView,
      originalText: commentText,
      newText: linkText
    })
    waitForApplication()
  })

  after(() => {
    cy.task('replaceTextInFile', {
      filename: indexView,
      originalText: linkText,
      newText: commentText
    })
    deleteFile(startView)
  })

  it('click start link', () => {
    cy.get('a[href="/start"]').should('contains.text', startText).click()
    cy.get('a[data-module="govuk-button"]')
      .should('contains.text', 'Start')
  })
})
