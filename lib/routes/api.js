
// npm dependencies
const express = require('express')
const sessionUtils = require('../session')

let expressApp
const routersBeforeAppWasSet = []

function configureAppToUseRouter (path, router) {
  if (expressApp) {
    expressApp.use(path, router)
  } else {
    routersBeforeAppWasSet.push({ router, path })
  }
}

function setupRouter (path = '/', config = {}) {
  if (typeof path !== 'string' && path !== undefined) {
    const errorMessage = 'setupRouter cannot be provided with a router,' +
      ' it sets up a router and returns it to you.'
    throw new Error(errorMessage)
  }
  const router = express.Router()
  configureAppToUseRouter(path, router)
  if (config.includeCoreMiddleware !== false) {
    if (path === '/manage-prototype') {
      throw new Error('found')
    }
    console.log('setting up core middleware', path)
    sessionUtils.setupAutoStoreDataInRouter(router)
  } else {
    console.log('not setting up core middleware', path)
  }
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
