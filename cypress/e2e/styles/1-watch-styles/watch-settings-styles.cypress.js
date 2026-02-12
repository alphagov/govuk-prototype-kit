// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, createFile, deleteFile, replaceInFile, restoreStarterFiles } = require('../../utils')

const appStylesPath = path.join('app', 'assets', 'sass')
const appStylesFolder = path.join(Cypress.env('projectFolder'), appStylesPath)

const settingsStyle = path.join(appStylesFolder, 'settings.scss')

const RED = 'rgb(255, 0, 0)'
const GREEN = 'rgb(0, 255, 0)'

const settingsContent = `$govuk-functional-colours: (brand: ${RED});`
const changedSettingsContent = `$govuk-functional-colours: (brand: ${GREEN});`

describe('watching settings.scss', () => {
  afterEach(restoreStarterFiles)

  it('Successfully reload settings changes', () => {
    waitForApplication()

    cy.task('log', 'The colour of the header should be as designed')
    cy.get('.govuk-header').should('not.have.css', 'background-color', RED)

    createFile(settingsStyle, { data: settingsContent })

    waitForApplication()

    cy.task('log', 'The colour of the header should be changed to red')
    cy.get('.govuk-header').should('have.css', 'background-color', RED)

    replaceInFile(settingsStyle, settingsContent, '', changedSettingsContent)

    waitForApplication()

    cy.task('log', 'The colour of the header should be changed to green')
    cy.get('.govuk-header').should('have.css', 'background-color', GREEN)

    deleteFile(settingsStyle)

    waitForApplication()

    cy.task('log', 'The colour of the header should be as designed')
    cy.get('.govuk-header').should('not.have.css', 'background-color', GREEN)
  })
})
