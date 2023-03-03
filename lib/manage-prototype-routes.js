// npm dependencies
const csrf = require('csurf')

const csrfProtection = csrf({ cookie: false })

const {
  contextPath,
  setKitRestarted,
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
  postPluginsStatusHandler
} = require('./manage-prototype-handlers')
const { recursiveDirectoryContentsSync } = require('./utils')
const path = require('path')
const fs = require('fs')
const { projectDir } = require('./utils/paths')

const router = require('../index').requests.setupRouter(contextPath)

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

// Be aware that changing this path for monitoring the status of a plugin will affect the
// kit upgrade process as the browser request and server route would be out of sync.
router.post('/plugins/:mode/status', postPluginsStatusHandler)

router.get('/plugins/:mode', csrfProtection, getPluginsModeHandler)

router.post('/plugins/:mode', postPluginsModeMiddleware)

router.post('/plugins/:mode', csrfProtection, postPluginsModeHandler)

router.get('/__debug__/log-files', (req, res) => {
  // res.send('found')
  const dirContents = recursiveDirectoryContentsSync(path.join(projectDir, req.query.dir))
  const string = JSON.stringify(dirContents, null, 2)
  console.log(string)
  if (req.query.saveToFile) {
    fs.writeFileSync(path.join(__dirname, '..', req.query.saveToFile), string)
  }
  res.send(`App views contents:\n<br/>\n ${string}`)
})

setKitRestarted(true)

module.exports = router
