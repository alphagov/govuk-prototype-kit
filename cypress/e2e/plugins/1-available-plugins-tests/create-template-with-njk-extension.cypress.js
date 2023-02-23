// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication } = require('../../utils')

const manageTemplatesPagePath = '/manage-prototype/templates'
const panelCompleteQuery = '[aria-live="polite"] #panel-complete'
const plugin = '@govuk-prototype-kit/common-templates'

const appConfigPath = path.join('app', 'config.json')
const appConfig = path.join(Cypress.env('projectFolder'), appConfigPath)

async function loadTemplatesPage () {
  cy.task('log', 'Visit the manage prototype templates page')
  await waitForApplication(manageTemplatesPagePath)
}

describe('create template with njk extension', () => {
  it('create template', () => {
    cy.task('mergePropertiesIntoJsonFile', { filename: appConfig, newProperties: { useNjkExtensions: null } })
  })
})
