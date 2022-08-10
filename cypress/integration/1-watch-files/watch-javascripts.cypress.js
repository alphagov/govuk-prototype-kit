const path = require('path')

const { waitForApplication } = require('../utils')

const appJs = path.join(Cypress.env('projectFolder'), 'app', 'assets', 'javascripts', 'application.js')
const backupAppJs = path.join(Cypress.env('tempFolder'), 'temp-application.js')

describe('watch application.js', () => {
  before(() => {
    waitForApplication()

    // backup application.js
    cy.task('copyFile', { source: appJs, target: backupAppJs })
  })

  after(() => {
    // restore files
    cy.task('copyFile', { source: backupAppJs, target: appJs })
  })

  it('changes to application.js should be reflected in browser', (done) => {
    const onAlert = cy.stub()
    cy.on('window:alert', onAlert)

    const markerText = '// Add JavaScript here'
    const newText = markerText + '\n  ' + "window.alert('Test')"

    cy.task('replaceTextInFile', {
      filename: appJs,
      originalText: markerText,
      newText
    })

    // wait for page to be reloaded by Browsersync
    cy.once('window:load', () => {
      cy.wait(1000)
      expect(onAlert).to.be.calledWith('Test')
      done()
    })
  })
})
