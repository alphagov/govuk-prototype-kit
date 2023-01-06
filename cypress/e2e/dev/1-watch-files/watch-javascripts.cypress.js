
// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication } = require('../../utils')

const appJsPath = path.join('app', 'assets', 'javascripts', 'application.js')
const appJs = path.join(Cypress.env('projectFolder'), appJsPath)

describe('watch application.js', () => {
  before(() => {
    // Restore application.js from prototype starter
    cy.task('copyFromStarterFiles', { filename: appJsPath })
    waitForApplication()
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
