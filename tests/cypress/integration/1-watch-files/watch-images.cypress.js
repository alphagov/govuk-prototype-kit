const path = require('path')

const { waitForApplication } = require('../utils')

const imageFile = 'larry-the-cat.jpg'
const cypressImages = path.join(Cypress.config('fixturesFolder'), 'images')
const appImages = path.join(Cypress.env('projectFolder'), 'app', 'assets', 'images')
const publicImages = 'public/images'

describe('watch image files', () => {
  before(() => {
    waitForApplication()
  })

  afterEach(() => {
    // delete temporary files
    cy.task('deleteFile', { filename: path.join(Cypress.env('projectFolder'), publicImages, imageFile) })
    cy.wait(2000)
    cy.task('deleteFile', { filename: path.join(appImages, imageFile) })
  })

  it(`image created in ${appImages} should be copied to ${publicImages} and accessible from the browser`, () => {
    const source = path.join(cypressImages, imageFile)
    const target = path.join(appImages, imageFile)
    const publicImage = `${publicImages}/${imageFile}`

    cy.task('log', `Copying ${source} to ${target}`)
    cy.task('copyFile', { source, target })

    cy.task('log', `Requesting ${publicImage}`)
    cy.request(`/${publicImage}`, { timeout: 20000, retryOnStatusCodeFailure: true })
      .then(response => expect(response.status).to.eq(200))
  })
})
