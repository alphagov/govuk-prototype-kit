const express = require('express')
const {getSessionMiddleware, autoStoreData, addCheckedFunction} = require('../sessionUtils')
const authentication = require('../../lib/middleware/authentication/authentication.js')
const fse = require("fs-extra");
const path = require("path");
const {packageDir} = require("../path-utils");
const extensions = require("../extensions/extensions");
const {getConfig} = require("../config");
let expressApp

const routersBeforeAppWasSet = []
const authenticationMiddleware = [authentication.middleware()]

const standardMiddleware = [getSessionMiddleware()]

if (getConfig().useAutoStoreData) {
  standardMiddleware.push(autoStoreData)
}

const configureAppToUseRouter = (path, router) => {
  if (expressApp) {
    expressApp.use(path, router)
  } else {
    routersBeforeAppWasSet.push({router, path})
  }
}

const generateStandardModel = async () => {
  const packageJson = await fse.readJson(path.join(packageDir, 'package.json'))
  extensions.setExtensionsByType()

  const {useAutoStoreData, useCookieSessionStore = false, serviceName} = getConfig()
  const extensionConfig = extensions.getAppConfig({
    scripts: ['/public/javascripts/application.js'],
    stylesheets: ['/public/stylesheets/application.css']
  })

  return {
    asset_path: '/public/',
    useAutoStoreData,
    useCookieSessionStore,
    releaseVersion: 'v' + packageJson.version,
    serviceName,
    extensionConfig
  }
}

const mergeWithStandardModel = async (model) => ({ ...(await generateStandardModel()), ...model })

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
      if (config.authenticationRequired === undefined || config.authenticationRequired === true) {
        router.use(authenticationMiddleware)
      }
      if (config.useStandardMiddleware === undefined || config.useStandardMiddleware === true) {
        router.use(standardMiddleware)
      }

      return router
    }, serveDirectory: (urlPath, directoryPath) => {
      configureAppToUseRouter(urlPath, express.static(directoryPath))
    },
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
