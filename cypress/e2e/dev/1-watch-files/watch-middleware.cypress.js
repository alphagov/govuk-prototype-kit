const path = require('path')

const { waitForApplication, deleteFile, createFile, copyFile } = require('../../utils')

const testPath = '/cypress-test-middleware'
const appRoutes = path.join(Cypress.env('projectFolder'), 'app', 'routes.js')
const backupRoutes = path.join(Cypress.env('tempFolder'), 'temp-routes.js')
const appMiddleware = path.join(Cypress.env('projectFolder'), 'app', 'middleware.js')

const middlewareContent = `
const helmet = require('helmet')
const addMiddleware = require('govuk-prototype-kit').requests.addMiddleware()

addMiddleware(helmet())
`

const routesContent = `
const router = require('govuk-prototype-kit').requests.setupRouter()

router.get('${testPath}', (req, res) => res.send(200))
`

const installMiddleware = () => {
  cy.task('log', 'Install the middleware')
  cy.exec(`cd ${Cypress.env('projectFolder')} && npm install helmet`)
  createFile(appMiddleware, { data: middlewareContent })
  cy.wait(6000)
}

const uninstallMiddleware = () => {
  cy.task('log', 'Uninstall the middleware')
  cy.exec(`cd ${Cypress.env('projectFolder')} && npm uninstall helmet`)
  deleteFile(appMiddleware)
  cy.wait(6000)
}

describe('watch middleware file', () => {
  before(() => {
    uninstallMiddleware()
    copyFile(appRoutes, backupRoutes)
    createFile(appRoutes, { data: routesContent })
    waitForApplication()
  })

  after(() => {
    uninstallMiddleware()
    copyFile(backupRoutes, appRoutes)
    waitForApplication()
  })

  it('install and uninstall middleware', () => {
    cy.task('log', 'Prove helmet middleware is not installed')
    cy.request(testPath, { retryOnStatusCodeFailure: true })
      .then(response => {
        expect(response.status).to.eq(200)
        expect(response.headers['cross-origin-resource-policy']).to.eq(undefined)
      })

    installMiddleware()
    waitForApplication()

    cy.task('log', 'Prove helmet middleware is installed')
    cy.request(testPath, { retryOnStatusCodeFailure: true })
      .then(response => {
        expect(response.status).to.eq(200)
        expect(response.headers['cross-origin-resource-policy']).to.eq('same-origin')
      })

    uninstallMiddleware()
    waitForApplication()

    cy.task('log', 'Prove helmet middleware is not installed')
    cy.request(testPath, { retryOnStatusCodeFailure: true })
      .then(response => {
        expect(response.status).to.eq(200)
        expect(response.headers['cross-origin-resource-policy']).to.eq(undefined)
      })
  })
})
