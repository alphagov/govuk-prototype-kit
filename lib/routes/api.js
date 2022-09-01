const express = require('express')

let expressApp
const routersBeforeAppWasSet = []

const configureAppToUseRouter = (path, router) => {
  if (expressApp) {
    expressApp.use(path, router)
  } else {
    routersBeforeAppWasSet.push({ router, path })
  }
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
      configureAppToUseRouter(path, router)
      return router
    },
    serveDirectory: (urlPath, directoryPath) => {
      configureAppToUseRouter(urlPath, express.static(directoryPath))
    }
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
