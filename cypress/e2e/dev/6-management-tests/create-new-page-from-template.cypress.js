
// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication, getTemplateLink, deleteFile } = require('../../utils')

const viewFolder = path.join(Cypress.env('projectFolder'), 'app', 'views')

const startPageView = path.join(viewFolder, 'start.html')
const startPagePath = '/start'

const validUnicodePageView = path.join(viewFolder, 'brontë.html')
const validUnicodePagePath = '/brontë'

const manageTemplatesPagePath = '/manage-prototype/templates'

describe('create new page', () => {
  before(() => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // we expect an error with message 'Cannot read properties of undefined (reading 'documentReady')'
      // and don't want to fail the test so we return false
      if (err.message.includes('Cannot read properties of undefined (reading \'documentReady\')')) {
        return false
      }
      // we still want to ensure there are no other unexpected
      // errors, so we let them fail the test
    })
    deleteFile(startPageView)
    deleteFile(validUnicodePageView)
    waitForApplication(manageTemplatesPagePath)
  })

  it('View the start page from the management page', () => {
    cy.task('log', 'Visit the manage prototype templates page')
    cy.get(`a[href="${getTemplateLink('view', 'govuk-prototype-kit', '/lib/nunjucks/templates/start.html')}"]`).click()

    cy.task('log', 'The start page template should be displayed')
    cy.get('.govuk-button--start')
      .should('contains.text', 'Start now')
  })

  describe('Create the start page from the management page', () => {
    const testCreatePage = (pagePath, pageView) => () => {
      cy.task('log', 'The start page should not be found')
      cy.visit(pagePath, { failOnStatusCode: false })
      cy.get('body')
        .should('contains.text', `Page not found: ${pagePath}`)

      cy.task('log', 'Visit the manage prototype templates page')
      cy.visit(manageTemplatesPagePath)

      cy.get(`a[href="${getTemplateLink('install', 'govuk-prototype-kit', '/lib/nunjucks/templates/start.html')}"]`).click()

      cy.task('log', 'Create the page')
      cy.get('.govuk-heading-l')
        .should('contains.text', 'Create new Start page')
      cy.get('.govuk-label')
        .should('contains.text', 'Path for the new page')
      cy.get('#chosen-url')
        .type(pagePath)
      cy.get('.govuk-button')
        .should('contains.text', 'Create page').click()

      cy.task('log', 'Confirmation page')
      cy.get('.govuk-heading-l')
        .should('contains.text', 'Page created')

      cy.task('log', 'Confirm the page exists')
      cy.get(`a[href="${pagePath}"]`)
        .should('contains.text', pagePath).click()
      cy.task('log', 'The start page should be displayed')
      cy.get('.govuk-button--start')
        .should('contains.text', 'Start now')

      cy.task('log', 'Confirm the view of the page exists where expected')
      cy.task('existsFile', { filename: pageView })
    }

    it(`where url is ${startPagePath}`, testCreatePage(startPagePath, startPageView))

    it(`where url is ${validUnicodePagePath}`, testCreatePage(validUnicodePagePath, validUnicodePageView))
  })

  describe('Invalid urls entered', () => {
    const testError = (url, error) => () => {
      url && cy.get('input').type(url)
      cy.get('form').submit()
      cy.get('.govuk-error-summary__list').should('contains.text', error)
      cy.get('#chosen-url-error').should('contains.text', error)
    }

    const errors = {
      exists: 'Path already exists',
      missing: 'Enter a path',
      singleSlash: 'Path must not be a single forward slash (/)',
      endsWithSlash: 'Path must not end in a forward slash (/)',
      multipleSlashes: 'must not include a slash followed by another slash (//)',
      slash: 'Path must begin with a forward slash (/)',
      invalid: 'Path must not include !$&\'()*+,;=:?#[]@.% or space'
    }

    beforeEach(() => {
      cy.visit(manageTemplatesPagePath)
      cy.get(`a[href="${getTemplateLink('install', 'govuk-prototype-kit', '/lib/nunjucks/templates/start.html')}"]`).click()
    })

    it('already exists', testError(startPagePath, errors.exists))

    it('empty', testError('', errors.missing))

    it('empty (multiple spaces)', testError('         ', errors.missing))

    it('single slash only', testError('/', errors.singleSlash))

    it('missing starting slash', testError('foo/bar', errors.slash))

    it('ends with a slash', testError('/foo/bar/', errors.endsWithSlash))

    it('contains consecutive slashes', testError('//bar/foo', errors.multipleSlashes))

    it('invalid (contains a search parameter)', testError('/?param=true', errors.invalid))

    it('invalid (contains spaces in the url)', testError('/foo bar/baz bar', errors.invalid))

    it('invalid (random)', testError('/$$fr%%"pp', errors.invalid))
  })
})
