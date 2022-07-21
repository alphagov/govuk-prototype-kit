import path from 'path'
import { deleteFile } from '../utils'

const { waitForApplication, copyFile } = require('../utils')

const projectFolder = Cypress.env('projectFolder')

const fixtures = path.join(Cypress.config('fixturesFolder'))

const fixtureViews = path.join(fixtures, 'views')
const stepByStepNavigationFixtureView = path.join(fixtureViews, 'step-by-step-navigation.html')

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

const runScript = (script) => {
  script = `cd ${projectFolder} && ${script}`
  cy.task('log', script)
  cy.exec(script)
}

describe('Step by step journey', async () => {
  before(() => {
    runScript('npm install jquery')
    waitForApplication()
    copyFile(stepByStepNavigationFixtureView, stepByStepNavigationView)
    waitForApplication()
    cy.visit(stepByStepNavigationPath)
    cy.get('h1').should('contains.text', 'Juggling Tricks: step by step')
  })

  after(() => {
    deleteFile(stepByStepNavigationView)
    runScript('npm uninstall jquery')
  })

  it('renders ok', () => {
    cy.get(titleQuery(1)).should('contain.text', 'Check you can learn to perform juggling tricks')
    cy.get(titleQuery(2)).should('contain.text', 'Juggling while standing on one foot')
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
