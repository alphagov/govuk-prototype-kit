const { waitForApplication } = require('../utils')
const { hostName } = require('../../config')
const imageFile = 'larry-the-cat.jpg'
const cypressImages = 'cypress/fixtures/images'
const appImages = 'app/assets/images'
const publicImages = 'public/images'

describe('watch image files', () => {
  before(() => {
    waitForApplication()
  })

  afterEach(() => {
    // delete temporary files
    cy.task('deleteFile', { filename: `${publicImages}/${imageFile}` })
    cy.wait(2000)
    cy.task('deleteFile', { filename: `${appImages}/${imageFile}` })
  })

  it(`image created in ${appImages} should be copied to ${publicImages} and accessible from the browser`, () => {
    const source = `${cypressImages}/${imageFile}`
    const target = `${appImages}/${imageFile}`
    const publicImage = `${publicImages}/${imageFile}`

    cy.task('log', `Copying ${source} to ${target}`)
    cy.task('copyFile', { source, target })

    cy.task('log', `Requesting ${publicImage}`)
    cy.request(`${hostName}/${publicImage}`, { timeout: 20000, retryOnStatusCodeFailure: true })
      .then(response => expect(response.status).to.eq(200))
  })
})
