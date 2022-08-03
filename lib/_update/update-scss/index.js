const {
  appSassPatternsPath,
  libSassPatternsPath,
  appSassPath,
  libSassPath,
  removeKitSassFromApplicationSass,
  removeKitSassFromAppSassPath,
  removeLegacyIE8Sass
} = require('./update_scss')

module.exports.updateScss = function () {
  removeKitSassFromApplicationSass()
  removeKitSassFromAppSassPath(appSassPatternsPath, libSassPatternsPath)
  removeKitSassFromAppSassPath(appSassPath, libSassPath)
  removeLegacyIE8Sass()
}
