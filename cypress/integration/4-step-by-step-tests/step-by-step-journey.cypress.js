import path from 'path'
import { deleteFile } from '../utils'

const { waitForApplication, copyFile } = require('../utils')

const projectFolder = Cypress.env('projectFolder')

const stepByStepNavigationTemplateView = path.join(Cypress.env('packageFolder') || Cypress.env('projectFolder'), 'docs', 'views', 'templates', 'step-by-step-navigation.html')

const appViews = path.join(projectFolder, 'app', 'views')
const stepByStepNavigationView = path.join(appViews, 'step-by-step-navigation.html')

const stepByStepNavigationPath = '/step-by-step-navigation'

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
describe('Step by step journey', async () => {
  before(() => {
    waitForApplication()
    copyFile(stepByStepNavigationTemplateView, stepByStepNavigationView)
    waitForApplication()
    cy.visit(stepByStepNavigationPath)
    cy.get('h1').should('contains.text', 'Learn to drive a car: step by step')
  })

  after(() => {
    deleteFile(stepByStepNavigationView)
  })

  it('renders ok', () => {
    cy.get(titleQuery(1)).should('contain.text', 'Check you\'re allowed to drive')
    cy.get(titleQuery(2)).should('contain.text', 'Get a provisional licence')
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
