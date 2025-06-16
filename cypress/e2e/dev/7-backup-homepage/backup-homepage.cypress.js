// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, restoreStarterFiles } = require('../../utils')

const homepageFile = path.join('app', 'views', 'index.html')

describe('backup homepage', () => {
  afterEach(restoreStarterFiles)

  it('deleting default layout does not cause pages to fail to render', () => {
    waitForApplication()
    cy.visit('/')

    cy.task('deleteFile', { filename: path.join(Cypress.env('projectFolder'), homepageFile) })

    cy.visit('/')
    cy.get('h1').should('contains.text', 'Your prototype homepage is missing')
  })
})
