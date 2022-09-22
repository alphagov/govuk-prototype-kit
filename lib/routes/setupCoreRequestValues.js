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
