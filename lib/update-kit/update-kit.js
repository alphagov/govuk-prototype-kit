const path = require('path')
const fs = require('fs')
const { projectDir, packageDir } = require('../path-utils')
const appSassPath = path.join(projectDir, 'app', 'assets', 'sass')
const appSassPatternsPath = path.join(appSassPath, 'patterns')
const applicationScssPath = path.join(appSassPath, 'application.scss')
const libSassPath = path.join(packageDir, 'lib', 'assets', 'sass')
const libSassPatternsPath = path.join(libSassPath, 'patterns')

function removeKitSassFromApplicationSass () {
  try {
    const contents = fs.readFileSync(applicationScssPath, { encoding: 'utf-8' })
    const userContentsStart = contents.indexOf('// Add extra styles here')
    if (userContentsStart > 0) {
      fs.writeFileSync(applicationScssPath, contents.substring(userContentsStart))
    }
  } catch (err) {
    console.error(err.message)
    console.error(err.stack)
  }
}

function removeKitSassFromAppSassPath (sassPath, kitSassPath) {
  fs.readdirSync(kitSassPath, { withFileTypes: true })
    .forEach(file => {
      try {
        const filePath = path.join(sassPath, file.name)
        if (fs.existsSync(filePath) && file.isFile()) {
          fs.unlinkSync(path.join(sassPath, file.name))
        }
      } catch (err) {
        console.error(err.message)
        console.error(err.stack)
      }
    })
}

// These exports are here only for tests
module.exports = {
  removeKitSassFromApplicationSass,
  removeKitSassFromAppSassPath,
  appSassPath,
  libSassPath,
  appSassPatternsPath,
  libSassPatternsPath
}
