
// npm dependencies
const express = require('express')

let expressApp
const routersBeforeAppWasSet = []

function configureAppToUseRouter (path, router) {
  if (expressApp) {
    expressApp.use(path, router)
  } else {
    routersBeforeAppWasSet.push({ router, path })
  }
}

function _getCallerFile() {
  var originalFunc = Error.prepareStackTrace;

  var callerfile
  var callerline
  try {
    var err = new Error()
    var currentfile

    Error.prepareStackTrace = function (err, stack) { return stack }

    currentfile = err.stack.shift().getFileName()

    while (err.stack.length) {
      const nextLine = err.stack.shift()
      callerfile = nextLine.getFileName()
      callerline = nextLine.getLineNumber()

      if (currentfile !== callerfile) break
    }
  } catch (e) {}

  Error.prepareStackTrace = originalFunc

  return { callerfile, callerline }
}

function setupRouter (path = '/') {
  const callerInfo = _getCallerFile()
  console.log(callerInfo)
  if (typeof path !== 'string' && path !== undefined) {
    const errorMessage = 'setupRouter cannot be provided with a router,' +
      ' it sets up a router and returns it to you.'
    throw new Error(errorMessage)
  }
  const router = express.Router()
  router.use((req, res, next) => {
    req.app.locals.lastUsedRouterFile = callerInfo.callerfile
    req.app.locals.lastUsedRouterFileLine = callerInfo.callerline
    next()
  })
  configureAppToUseRouter(path, router)
  return router
}

function serveDirectory (urlPath, directoryPath) {
  configureAppToUseRouter(urlPath, express.static(directoryPath))
}

function setApp (app) {
  expressApp = app
  routersBeforeAppWasSet.forEach(config => {
    configureAppToUseRouter(config.path, config.router)
  })
}

function resetState () {
  expressApp = undefined
  routersBeforeAppWasSet.splice(0, routersBeforeAppWasSet.length)
}

module.exports = {
  external: {
    setupRouter,
    serveDirectory
  },
  setApp,
  resetState
}
