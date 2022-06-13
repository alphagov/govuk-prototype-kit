const {
  appSassPatternsPath,
  libSassPatternsPath,
  appSassPath,
  libSassPath,
  removeKitSassFromApplicationSass,
  removeKitSassFromAppSassPath
} = require('./update-kit')

removeKitSassFromApplicationSass()
removeKitSassFromAppSassPath(appSassPatternsPath, libSassPatternsPath)
removeKitSassFromAppSassPath(appSassPath, libSassPath)
