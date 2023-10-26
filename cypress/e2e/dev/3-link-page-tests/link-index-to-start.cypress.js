// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, copyFile, restoreStarterFiles } = require('../../utils')

const appViewsPath = path.join('app', 'views')
const indexViewPath = path.join(appViewsPath, 'index.html')

const indexView = path.join(Cypress.env('projectFolder'), indexViewPath)
const startView = path.join(Cypress.env('projectFolder'), appViewsPath, 'start.html')
const templateStartView = path.join(Cypress.config('fixturesFolder'), 'views', 'start.html')

const commentText = '{% include "govuk-prototype-kit/includes/homepage-bottom.njk" %}'

const startText = 'Click here to start'

const linkText = `<a href="/start">${startText}</a>`

describe('Link index page to start page', async () => {
  beforeEach(() => {
    copyFile(templateStartView, startView)
    cy.task('replaceTextInFile', {
      filename: indexView,
      originalText: commentText,
      newText: linkText
    })
  })

  afterEach(restoreStarterFiles)

  it('click start link', () => {
    waitForApplication()
    cy.get('a[href="/start"]').contains(startText).click()
    cy.get('a[role="button"]')
      .contains('Start')
  })
})
