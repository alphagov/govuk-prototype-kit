const express = require('express')
const {getSessionMiddleware, autoStoreData} = require('../sessionUtils')
const getAuthenticationMiddleware = require('../../lib/middleware/authentication/authentication.js')

let expressApp
const routersBeforeAppWasSet = []

const standardMiddleware = [getAuthenticationMiddleware(), getSessionMiddleware()]

const configureAppToUseRouter = (path, router) => {
  if (expressApp) {
    expressApp.use(path, router)
  } else {
    routersBeforeAppWasSet.push({router, path})
  }
}

module.exports = {
  external: {
    setupRouter: (path = '/', config) => {
      if (typeof config !== 'object') {
        config = {}
      }
      if (typeof path !== 'string' && path !== undefined) {
        const errorMessage = 'setupRouter cannot be provided with a router,' + ' it sets up a router and returns it to you.'
        throw new Error(errorMessage)
      }
      const router = express.Router()
      configureAppToUseRouter(path, router)
      if (config.useStandardMiddleware === undefined || config.useStandardMiddleware === true) {
        router.use(standardMiddleware)
      }

      return router
    }, serveDirectory: (urlPath, directoryPath) => {
      configureAppToUseRouter(urlPath, express.static(directoryPath))
    }, 
    standardMiddleware
  }, setApp: (app) => {
    expressApp = app
    routersBeforeAppWasSet.forEach(config => {
      configureAppToUseRouter(config.path, config.router)
    })
  }, resetState: () => {
    expressApp = undefined
    routersBeforeAppWasSet.splice(0, routersBeforeAppWasSet.length)
  }
}
