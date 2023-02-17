// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, replaceInFile, createFile } = require('../../utils')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const indexView = path.join(appViews, 'index.html')

const appStylesPath = path.join('app', 'assets', 'sass')
const appStylesFolder = path.join(Cypress.env('projectFolder'), appStylesPath)

const settingsStyle = path.join(appStylesFolder, `settings.scss`)
const styleContent = `
body { 
    color: green; 
    background: pink;
}
`
const newContent = `<link href="/public/stylesheets/settings.css" rel="stylesheet" type="text/css" />

{% include "./stylesheets-plugins.njk" %}`

const oldContent = `{% include "./stylesheets-plugins.njk" %}`

describe('watching settings.scss', () => {
    
    before(() => {
        cy.task('deleteFile', { filename: settingsStyle })
        console.log(indexView)
        createFile(settingsStyle, { data: styleContent })
        replaceInFile(indexView, oldContent, '', newContent)

    })

    after('', () => {
        replaceInFile(indexView, newContent, '', oldContent)
        cy.task('deleteFile', { filename: settingsStyle })
    })

    it('Successfully reloaed changes', () => {
        waitForApplication()

        cy.task('log', `Hello Ben!`)

        
    })

})