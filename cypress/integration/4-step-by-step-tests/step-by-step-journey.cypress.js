import path from 'path'
import { deleteFile } from '../utils'

const { waitForApplication, copyFile } = require('../utils')

const projectFolder = Cypress.env('projectFolder')

const appViews = path.join(projectFolder, 'app', 'views')

const showHideAllLinkQuery = '.app-step-nav__controls button'
const toggleButtonQuery = (step) => `[data-position="${step}"]`
const showHideLinkQuery = (step) => `[data-position="${step}"]`
const panelQuery = (step) => `[data-position="${step}.1"]`
const titleQuery = (step) => `[data-position="${step}"] .js-step-title-text`

const assertVisible = (step) => {
  cy.get(showHideLinkQuery(step)).should('contains.text', 'Hide')
  cy.get(panelQuery(step)).should('be.visible')
}

const assertHidden = (step) => {
  cy.get(panelQuery(step)).should('not.be.visible')
  cy.get(showHideLinkQuery(step)).should('contains.text', 'Show')
}

const stepByStepTestData = [{
  name: 'step-by-step-navigation',
  heading: 'Learn to drive a car: step by step',
  title1: 'Check you\'re allowed to drive',
  title2: 'Get a provisional licence'
}, {
  name: 'start-with-step-by-step',
  heading: 'Check what age you can drive',
  title1: 'Check you\'re allowed to drive',
  title2: 'Get a provisional licence'
}]

stepByStepTestData.forEach(({ name, heading, title1, title2 }) => {
  const stepByStepTemplateView = path.join(Cypress.env('packageFolder') || Cypress.env('projectFolder'), 'docs', 'views', 'templates', `${name}.html`)
  const stepByStepView = path.join(appViews, `${name}.html`)
  const stepByStepPath = `/${name}`

  describe(`${name} journey`, async () => {
    before(() => {
      waitForApplication()
      copyFile(stepByStepTemplateView, stepByStepView)
      waitForApplication()
      cy.visit(stepByStepPath)
      cy.get('h1').should('contains.text', heading)
    })

    after(() => {
      deleteFile(stepByStepView)
    })

    it('renders ok', () => {
      cy.get(titleQuery(1)).should('contain.text', title1)
      cy.get(titleQuery(2)).should('contain.text', title2)
      assertHidden(1)
      assertHidden(2)
    })

    it('toggle step 1', () => {
      // click toggle button and check that only step 1 details are visible
      cy.get(toggleButtonQuery(1)).click()
      assertVisible(1)
      assertHidden(2)

      // click toggle button and check that only both steps are hidden
      cy.get(toggleButtonQuery(1)).click()
      assertHidden(1)
      assertHidden(2)
    })

    it('toggle step 2', () => {
      // click toggle button and check that only step 1 details are visible
      cy.get(toggleButtonQuery(2)).click()
      assertHidden(1)
      assertVisible(2)

      // click toggle button and check that only both steps are hidden
      cy.get(toggleButtonQuery(2)).click()
      assertHidden(1)
      assertHidden(2)
    })

    it('toggle all steps', () => {
      // click toggle button and check that all steps details are visible
      cy.get(showHideAllLinkQuery).should('contains.text', 'Show all').click()
      assertVisible(1)
      assertVisible(2)

      // click toggle button and check that all steps details are hidden
      cy.get(showHideAllLinkQuery).should('contains.text', 'Hide all').click()
      assertHidden(1)
      assertHidden(2)
    })
  })
})
