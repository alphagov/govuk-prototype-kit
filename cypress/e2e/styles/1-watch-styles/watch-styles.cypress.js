// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, restoreStarterFiles } = require('../../utils')

const appStylesPath = path.join('app', 'assets', 'sass')
const appStylesheetPath = path.join(appStylesPath, 'application.scss')
const appStylesFolder = path.join(Cypress.env('projectFolder'), appStylesPath)
const appStylesheet = path.join(Cypress.env('projectFolder'), appStylesheetPath)

const cypressTestStyles = 'cypress-test'
const cypressTestStylePattern = path.join(appStylesFolder, 'patterns', `_${cypressTestStyles}.scss`)
const publicStylesheet = 'public/stylesheets/application.css'

const RED = 'rgb(255, 0, 0)'
const BLUE = 'rgb(29, 112, 184)'

describe('watch sass files', () => {
  describe(`sass file ${cypressTestStylePattern} should be created and included within the ${appStylesheet} and accessible from the browser as /${publicStylesheet}`, () => {
    const cssStatement = `
      .govuk-template--rebranded .govuk-header { background: red; }
    `

    afterEach(restoreStarterFiles)

    it('The colour of the header should be changed to red then back to blue', () => {
      waitForApplication()

      cy.task('log', 'The colour of the header should be blue')
      cy.get('.govuk-header').should('have.css', 'background-color', BLUE)

      cy.task('log', `Create ${cypressTestStylePattern}`)
      cy.task('createFile', {
        filename: cypressTestStylePattern,
        data: cssStatement
      })

      cy.task('log', `Amend ${appStylesheet} to import ${cypressTestStyles}`)
      cy.task('appendFile', {
        filename: appStylesheet,
        data: `
      @import "patterns/${cypressTestStyles}";
      `
      })

      cy.task('log', 'The colour of the header should be changed to red')
      cy.get('.govuk-header').should('have.css', 'background-color', RED)
    })
  })
})
