import path from 'path'

const templates = path.join(Cypress.env('packageFolder') || Cypress.env('projectFolder'), 'docs', 'views', 'templates')
const startTemplate = path.join(templates, 'start.html')
const questionTemplate = path.join(templates, 'question.html')
const confirmationTemplate = path.join(templates, 'confirmation.html')

const fixtureViews = path.join(Cypress.config('fixturesFolder'), 'views')
const jugglingCheckAnswersFixtureView = path.join(fixtureViews, 'juggling-check-answers.html')

const components = path.join(fixtureViews, 'components')
const jugglingBallsComponent = path.join(components, 'juggling-balls-component.html')
const jugglingTrickComponent = path.join(components, 'juggling-trick-component.html')

const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views')
const startView = path.join(appViews, 'start.html')
const jugglingBallsView = path.join(appViews, 'juggling-balls.html')
const jugglingTrickView = path.join(appViews, 'juggling-trick.html')
const checkAnswersView = path.join(appViews, 'check-answers.html')
const confirmationView = path.join(appViews, 'confirmation.html')

const appDataFile = path.join(Cypress.env('projectFolder'), 'app', 'data', 'session-data-defaults.js')

const jugglingBallsPath = '/juggling-balls'
const jugglingTrickPath = '/juggling-trick'
const checkAnswersPath = '/check-answers'

const defaultHowManyBalls = 'None - I cannot juggle'
const defaultMostImpressiveTrick = 'None - I cannot do tricks'

const cleanUpPages = () => {
  cy.task('deleteFile', { filename: startView })
  cy.task('deleteFile', { filename: jugglingBallsView })
  cy.task('deleteFile', { filename: jugglingTrickView })
  cy.task('deleteFile', { filename: checkAnswersView })
  cy.task('deleteFile', { filename: confirmationView })
}

const copyFile = (source, target) => {
  cy.task('log', `Copy ${source} to ${target}`)
  cy.task('copyFile', { source, target })
}

const createQuestionView = (view, content, nextPath) => {
  copyFile(questionTemplate, view)
  cy.task('replaceTextInFile', { filename: view, originalText: '<h1 class="govuk-heading-xl">Heading or question goes here</h1>', newText: '' })
  cy.task('replaceTextInFile', { filename: view, originalText: '<p>[See <a href="https://design-system.service.gov.uk">the GOV.UK Design System</a> for examples]</p>', newText: '' })
  cy.task('replaceTextInFile', { filename: view, originalText: '<p>[Insert question content here]</p>', source: content })
  cy.task('replaceTextInFile', { filename: view, originalText: '/url/of/next/page', newText: nextPath })
}

const setUpPages = () => {
  // Set up start view
  copyFile(startTemplate, startView)
  cy.task('replaceTextInFile', { filename: startView, originalText: '<a href="#" role="button"', newText: `<a href="${jugglingBallsPath}" role="button"` })

  // Set up juggling balls view
  createQuestionView(jugglingBallsView, jugglingBallsComponent, jugglingTrickPath)

  // Set up juggling trick view
  createQuestionView(jugglingTrickView, jugglingTrickComponent, checkAnswersPath)

  // Set up check answers view
  copyFile(jugglingCheckAnswersFixtureView, checkAnswersView)

  // Set up confirmation view
  copyFile(confirmationTemplate, confirmationView)
}

const setUpData = () => {
  cy.task('replaceTextInFile', { filename: appDataFile, originalText: '// Insert values here', newText: `"how-many-balls": "${defaultHowManyBalls}", "most-impressive-trick": "${defaultMostImpressiveTrick}"` })
}

const clearUpData = () => {
  cy.task('replaceTextInFile', { filename: appDataFile, originalText: `"how-many-balls": "${defaultHowManyBalls}", "most-impressive-trick": "${defaultMostImpressiveTrick}"`, newText: '// Insert values here' })
}

module.exports = {
  setUpPages,
  setUpData,
  cleanUpPages,
  clearUpData
}
