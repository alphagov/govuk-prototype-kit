const {
  appSassPatternsPath,
  libSassPatternsPath,
  appSassPath,
  libSassPath,
  removeKitSassFromApplicationSass,
  removeKitSassFromAppSassPath,
  removeLegacyIE8Sass
} = require('./update_scss')

removeKitSassFromApplicationSass()
removeKitSassFromAppSassPath(appSassPatternsPath, libSassPatternsPath)
removeKitSassFromAppSassPath(appSassPath, libSassPath)
removeLegacyIE8Sass()
