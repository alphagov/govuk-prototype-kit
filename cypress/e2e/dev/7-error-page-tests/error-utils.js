const path = require('path')
const appRoutesPath = path.join('app', 'routes.js')
const appRoutes = path.join(Cypress.env('projectFolder'), appRoutesPath)

const errorRoutes = `// Start *
router.get('/test-page', (req, res, next) => {
    res.render('test-page.html')
  })

router.get('/error', (req, res, next) => {
    next(new Error('test error'))
  })
// End *
`
const routesReplaceText = '// Add your routes here'

const setupRouterForErrorTest = () => {
  cy.task('replaceTextInFile', { filename: appRoutes, originalText: routesReplaceText, newText: errorRoutes })
}

const setRouterBackToInitialState = () => {
  cy.task('replaceTextInFile', { filename: appRoutes, originalText: errorRoutes, newText: routesReplaceText })
}

module.exports = {
  setRouterBackToInitialState,
  setupRouterForErrorTest
}
