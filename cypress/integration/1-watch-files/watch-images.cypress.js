const path = require('path')

const { waitForApplication } = require('../utils')

const imageFile = 'larry-the-cat.jpg'
const cypressImages = path.join(Cypress.config('fixturesFolder'), 'images')
const appImages = path.join(Cypress.env('projectFolder'), 'app', 'assets', 'images')
const publicImages = 'public/images'

const pageFixture = 'larry-the-cat'
const pageFixtureName = `${pageFixture}.html`
const pageFixturePath = path.join(Cypress.config('fixturesFolder'), pageFixtureName)
const pageAppPath = path.join(Cypress.env('projectFolder'), 'app', 'views', pageFixtureName)

describe('watch image files', () => {
  before(() => {
    waitForApplication()
  })

  afterEach(() => {
    // delete test files
    cy.task('deleteFile', { filename: path.join(appImages, imageFile) })
    cy.task('deleteFile', { filename: path.join(Cypress.env('projectFolder'), publicImages, imageFile) })
    cy.task('deleteFile', { filename: pageAppPath })
    cy.wait(2000)
  })

  it(`image created in ${appImages} should be copied to ${publicImages} and accessible from the browser`, () => {
    const source = path.join(cypressImages, imageFile)
    const target = path.join(appImages, imageFile)
    const publicImage = `${publicImages}/${imageFile}`

    cy.task('log', 'Creating a page to view our image')
    cy.task('copyFile', { source: pageFixturePath, target: pageAppPath })

    cy.task('log', 'Our page should be missing its image')
    cy.visit(`/${pageFixture}`)
    cy.get('img#larry')
      .should('be.visible')
      .and(($img) => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.equal(0)
      })

    // When we do the copy, we expect the page to reload, so let's set up an
    // intercept so we can wait for that request
    cy.intercept(`/${pageFixture}`).as('reloadPage')

    cy.task('log', 'Copying the image to the app folder')
    cy.task('copyFile', { source, target })

    cy.task('log', 'Wait for the page to reload')
    cy.wait('@reloadPage')

    cy.task('log', 'Our page should now have its image')
    cy.get('img#larry')
      .should('be.visible')
      .and(($img) => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).not.to.equal(0)
      })

    cy.task('log', `Requesting ${publicImage}`)
    cy.request(`/${publicImage}`, { retryOnStatusCodeFailure: true })
      .then(response => expect(response.status).to.eq(200))
  })
})
