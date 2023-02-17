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

const oldSettingsContent = `
h1.govuk-heading-xl { 
    background-color: ${RED};
}
`

const newContent = `
  {% block stylesheets %}
    {{ super() }}
    <link href="/public/stylesheets/settings.css" rel="stylesheet" type="text/css" />
  {% endblock %}
  {% block content %}
  `

const oldContent = '{% block content %}'

describe('watching settings.scss', () => {

    before(() => {
        cy.task('deleteFile', { filename: settingsStyle })
        replaceInFile(indexView, oldContent, '', newContent)
    })

    after('', () => {
        replaceInFile(indexView, newContent, '', oldContent)
        cy.task('deleteFile', { filename: settingsStyle })
    })

    it('Successfully reloaded changes', () => {
        waitForApplication()

        cy.wait(2000)

        createFile(settingsStyle, { data: oldSettingsContent })

        cy.task('log', 'The colour of the header should be changed to red')
        cy.get('h1.govuk-heading-xl').should('have.css', 'background-color', RED)
    })

})