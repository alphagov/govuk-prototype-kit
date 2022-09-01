const express = require('express')

let expressApp
const routersBeforeAppWasSet = []

const configureAppToUseRouter = (router, path) => {
  expressApp.use(path, router)
}

module.exports = {
  external: {
    setupRouter: (path = '/') => {
      if (typeof path !== 'string' && path !== undefined) {
        const errorMessage = 'setupRouter cannot be provided with a router,' +
          ' it sets up a router and returns it to you.'
        throw new Error(errorMessage)
      }
      const router = express.Router()
      if (expressApp) {
        configureAppToUseRouter(router, path)
      } else {
        routersBeforeAppWasSet.push({ router, path })
      }
      return router
    }
  },
  setApp: (app) => {
    expressApp = app
    routersBeforeAppWasSet.forEach(config => {
      configureAppToUseRouter(config.router, config.path)
    })
  },
  resetState: () => {
    expressApp = undefined
    routersBeforeAppWasSet.splice(0, routersBeforeAppWasSet.length)
  }
}
