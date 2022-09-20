const express = require('express')
let expressApp

const routersBeforeAppWasSet = []
const standardMiddleware = []
const authenticationMiddleware = []

const configureAppToUseRouter = (path, router) => {
  if (expressApp) {
    expressApp.use(path, router)
  } else {
    routersBeforeAppWasSet.push({ router, path })
  }
}

function setupMiddlewareForRouter (middlewareArray, router) {
  middlewareArray.forEach(x => router.use(x))
}

const setupRouter = (path = '/', config) => {
  if (typeof config !== 'object') {
    config = {}
  }
  if (typeof path !== 'string' && path !== undefined) {
    const errorMessage = 'setupRouter cannot be provided with a router,' + ' it sets up a router and returns it to you.'
    throw new Error(errorMessage)
  }
  const router = express.Router()
  configureAppToUseRouter(path, router)

  if (config.authenticationRequired === undefined || config.authenticationRequired === true) {
    setupMiddlewareForRouter(authenticationMiddleware, router)
  }
  if (config.useStandardMiddleware === undefined || config.useStandardMiddleware === true) {
    setupMiddlewareForRouter(standardMiddleware, router)
  }

  return router
}
const serveDirectory = (urlPath, directoryPath) => {
  configureAppToUseRouter(urlPath, express.static(directoryPath))
}

const generateStandardModel = async () => {
  return {}
}

const mergeWithStandardModel = async (model) => ({ ...(await generateStandardModel()), ...model })

module.exports = {
  external: {
    setupRouter,
    serveDirectory,
    generateStandardModel,
    mergeWithStandardModel
  },
  setApp: (app) => {
    expressApp = app
    routersBeforeAppWasSet.forEach(config => {
      configureAppToUseRouter(config.path, config.router)
    })
  },
  resetState: () => {
    expressApp = undefined
    routersBeforeAppWasSet.splice(0, routersBeforeAppWasSet.length)
  }
}
