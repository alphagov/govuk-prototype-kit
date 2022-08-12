/*
 * Convenience module to make importing users app/config.js file easier,
 * handling the case where that files does not exist.
 */

const fs = require('fs')
const path = require('path')

const { appDir } = require('./path-utils')
const appConfig = path.join(appDir, 'config.js')

const config = fs.existsSync(appConfig) ? require(appConfig) : {}

module.exports = config
