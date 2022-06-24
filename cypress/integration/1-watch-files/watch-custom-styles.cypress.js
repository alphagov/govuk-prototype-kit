const path = require('path')

const { waitForApplication } = require('../utils')

const customStyleFile = path.join(Cypress.env('projectFolder'), 'app', 'assets', 'sass', 'custom.scss')
const appHeadView = path.join(Cypress.env('projectFolder'), 'app', 'views', 'includes', 'head.html')
const backupHeadView = path.join(Cypress.env('tempFolder'), 'temp-head.html')
const publicStylesheet = 'public/stylesheets/custom.css'

const GREEN = 'rgb(0, 255, 0)'
const BLACK = 'rgb(11, 12, 12)'

describe('watch custom sass files', () => {
  describe(`sass file ${customStyleFile} should be created and linked within ${appHeadView} and accessible from the browser as /${publicStylesheet}`, () => {
    const cssStatement = `
    .govuk-header { background: ${GREEN}; }
    `

    before(() => {
      waitForApplication()
      // backup head view
      cy.task('copyFile', { source: appHeadView, target: backupHeadView })
    })

    afterEach(() => {
      // restore head view
      cy.task('copyFile', { source: backupHeadView, target: appHeadView })

      // delete temporary files
      cy.task('deleteFile', { filename: path.join(Cypress.env('projectFolder'), publicStylesheet) })
      cy.task('deleteFile', { filename: customStyleFile })
      cy.get('.govuk-header').should('have.css', 'background-color', BLACK)
      cy.task('deleteFile', { filename: backupHeadView })
    })

    it('The colour of the header should be changed to green then back to black', () => {
      cy.task('log', 'The colour of the header should be black')
      cy.get('.govuk-header').should('have.css', 'background-color', BLACK)

      cy.task('log', `Create ${customStyleFile}`)
      cy.task('createFile', {
        filename: customStyleFile,
        data: cssStatement
      })

      cy.wait(6000)

      cy.task('log', `Amend ${appHeadView} to link ${publicStylesheet}`)
      cy.task('appendFile', {
        filename: appHeadView,
        data: `
  <link href="/${publicStylesheet}" rel="stylesheet" type="text/css" />
      `
      })

      cy.task('log', 'The colour of the header should be changed to green')
      cy.get('.govuk-header').should('have.css', 'background-color', GREEN)
    })
  })
})
