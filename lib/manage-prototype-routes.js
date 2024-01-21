// npm dependencies
const express = require('express')

const {
  contextPath,
  csrfProtection,
  getPageLoadedHandler,
  getCsrfTokenHandler,
  getClearDataHandler,
  postClearDataHandler,
  getPasswordHandler,
  postPasswordHandler,
  developmentOnlyMiddleware,
  getHomeHandler,
  getTemplatesHandler,
  getTemplatesViewHandler,
  getTemplatesInstallHandler,
  postTemplatesInstallHandler,
  getTemplatesPostInstallHandler,
  getPluginsHandler,
  postPluginsHandler,
  getPluginDetailsHandler,
  postPluginDetailsHandler,
  runPluginMode,
  getCommandStatus,
  getPluginsModeHandler,
  legacyUpdateStatusCompatibilityHandler
} = require('./manage-prototype-handlers')
const { packageDir, projectDir } = require('./utils/paths')
const { govukFrontendPaths } = require('./govukFrontendPaths')

const router = require('../index').requests.setupRouter(contextPath)

router.get('/csrf-token', getCsrfTokenHandler)

// Indicates page has loaded
router.get('/page-loaded', getPageLoadedHandler)

// Clear all data in session
router.get('/clear-data', getClearDataHandler)

router.post('/clear-data', postClearDataHandler)

// Render password page with a returnURL to redirect people to where they came from
router.get('/password', getPasswordHandler)

// Check authentication password
router.post('/password', postPasswordHandler)

// Middleware to ensure the routes specified below will render the manage-prototype-not-available
// view when the prototype is not running in development
router.use(developmentOnlyMiddleware)

router.get('/', getHomeHandler)

router.get('/templates', getTemplatesHandler)

router.get('/templates/view', getTemplatesViewHandler)

router.get('/templates/install', getTemplatesInstallHandler)

router.post('/templates/install', postTemplatesInstallHandler)

router.get('/templates/post-install', getTemplatesPostInstallHandler)

router.get('/plugins', getPluginsHandler)
router.post('/plugins', postPluginsHandler)
router.get('/plugins-installed', getPluginsHandler)

router.get('/plugin/:packageRef', getPluginDetailsHandler)
router.post('/plugin', postPluginDetailsHandler)
router.get('/plugin/:packageRef/:mode', getPluginsModeHandler)
router.post('/plugin/:packageRef/:mode', csrfProtection, runPluginMode)

router.get('/command/:commandId/status', getCommandStatus)

// // Be aware that changing this path for monitoring the status of a plugin will affect the
// // kit update process as the browser request and server route would be out of sync.
router.post('/plugins/:mode', legacyUpdateStatusCompatibilityHandler)

// Find GOV.UK Frontend (via internal package, project fallback)
router.use('/dependencies/govuk-frontend', express.static(
  govukFrontendPaths([packageDir, projectDir]).baseDir)
)

router.use((err, req, res, next) => {
  if (err.status === 404) {
    next(err)
  } else {
    res.status(err.status || 500).render('views/error-handling/server-error.njk', {
      error: {
        message: err.message,
        errorStack: err.stack
      }
    })
  }
})

module.exports = router
