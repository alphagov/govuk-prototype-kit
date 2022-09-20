const sessionUtils = require('../sessionUtils')
const { getSessionMiddleware, autoStoreData } = sessionUtils
const authentication = require('../../lib/middleware/authentication/authentication.js')
const fse = require('fs-extra')
const path = require('path')
const { packageDir } = require('../path-utils')
const extensions = require('../extensions/extensions')
const { getConfig } = require('../config')

const authenticationMiddleware = [authentication.middleware()]

const standardMiddleware = [getSessionMiddleware()]

if (getConfig().useAutoStoreData) {
  standardMiddleware.push(autoStoreData)
}

const generateStandardModel = async () => {
  const packageJson = await fse.readJson(path.join(packageDir, 'package.json'))
  extensions.setExtensionsByType()

  const { useAutoStoreData, useCookieSessionStore = false, serviceName } = getConfig()
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
