// npm dependencies
const express = require('express')

const {
  contextPath,
  setKitRestarted,
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
  getPluginsModeHandler,
  postPluginsModeMiddleware,
  postPluginsModeHandler,
  postPluginsStatusHandler,
  pluginCacheMiddleware,
  postPluginsHandler,
  getPluginDetailsHandler, postPluginDetailsHandler
} = require('./manage-prototype-handlers')
const path = require('path')
const { getInternalGovukFrontendDir } = require('./utils')

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

router.use(pluginCacheMiddleware)

router.get('/', getHomeHandler)

router.get('/templates', getTemplatesHandler)

router.get('/templates/view', getTemplatesViewHandler)

router.get('/templates/install', getTemplatesInstallHandler)

router.post('/templates/install', postTemplatesInstallHandler)

router.get('/templates/post-install', getTemplatesPostInstallHandler)

router.get('/plugins', getPluginsHandler)
router.post('/plugins', postPluginsHandler)
router.get('/plugins-installed', getPluginsHandler)

router.get('/plugin/:packageName', getPluginDetailsHandler)
router.post('/plugin', postPluginDetailsHandler)

// Be aware that changing this path for monitoring the status of a plugin will affect the
// kit update process as the browser request and server route would be out of sync.
router.post('/plugins/:mode/status', postPluginsStatusHandler)

router.get('/plugins/:mode', csrfProtection, getPluginsModeHandler)

router.post('/plugins/:mode', postPluginsModeMiddleware)

router.post('/plugins/:mode', csrfProtection, postPluginsModeHandler)

const partialGovukFrontendUrls = [
  'govuk/assets',
  'govuk/all.js',
  'govuk-prototype-kit/init.js'
]
partialGovukFrontendUrls.forEach(url => {
  router.use(`/dependencies/govuk-frontend/${url}`, express.static(path.join(getInternalGovukFrontendDir(), url)))
})

setKitRestarted(true)

module.exports = router
