// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, replaceInFile, createFile } = require('../../utils')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const indexView = path.join(appViews, 'index.html')

const appStylesPath = path.join('app', 'assets', 'sass')
const appStylesFolder = path.join(Cypress.env('projectFolder'), appStylesPath)

const settingsStyle = path.join(appStylesFolder, `settings.scss`)

const RED = 'rgb(255, 0, 0)'

const oldSettingsContent = `$govuk-brand-colour: ${RED}`

describe('watching settings.scss', () => {

    before(() => {
        cy.task('deleteFile', { filename: settingsStyle })
    })

    after('', () => {
        cy.task('deleteFile', { filename: settingsStyle })
    })

    it('Successfully reloaded changes', () => {
        waitForApplication()

        cy.wait(2000)

        createFile(settingsStyle, { data: oldSettingsContent })

        cy.task('log', 'The colour of the header should be changed to red')
        cy.get('.govuk-header__container').should('have.css', 'border-bottom-color', RED)
    })

})