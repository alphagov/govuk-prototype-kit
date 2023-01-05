
// core dependencies
const path = require('path')

// local dependencies
const { copyFile, waitForApplication } = require('../../utils')
const {
  assertHidden,
  assertVisible,
  showHideAllLinkQuery,
  titleQuery,
  toggleButtonQuery
} = require('../../step-by-step-utils')

const projectFolder = Cypress.env('projectFolder')

const appViews = path.join(projectFolder, 'app', 'views')

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
  const stepByStepTemplateView = path.join(Cypress.config('fixturesFolder'), 'views', `${name}.html`)
  const stepByStepView = path.join(appViews, `${name}.html`)
  const stepByStepPath = `/${name}`

  describe(`${name} journey`, async () => {
    before(() => {
      copyFile(stepByStepTemplateView, stepByStepView)
      waitForApplication()
    })

    const loadPage = async () => {
      cy.visit(stepByStepPath)
      cy.get('h1').should('contains.text', heading)
    }

    it('renders ok', () => {
      loadPage()
      cy.get(titleQuery(1)).should('contain.text', title1)
      cy.get(titleQuery(2)).should('contain.text', title2)
      assertHidden(1)
      assertHidden(2)
    })

    it('toggle step 1', () => {
      loadPage()
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
      loadPage()
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
      loadPage()
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
