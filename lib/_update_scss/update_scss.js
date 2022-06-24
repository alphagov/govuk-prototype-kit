const path = require('path')
const fs = require('fs')
const { projectDir, packageDir } = require('../path-utils')
const appSassPath = path.join(projectDir, 'app', 'assets', 'sass')
const appSassPatternsPath = path.join(appSassPath, 'patterns')
const libSassPath = path.join(packageDir, 'lib', 'assets', 'sass')
const libSassPatternsPath = path.join(libSassPath, 'patterns')
const ie8SassFiles = [
  'application-ie8.scss',
  'unbranded-ie8.scss'
]

function removeLegacyIE8Sass () {
  ie8SassFiles
    .forEach(filename => {
      try {
        const filePath = path.join(appSassPath, filename)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(path.join(appSassPath, filename))
        }
      } catch (err) {
        console.error(err.message)
        console.error(err.stack)
      }
    })
}

// These exports are here only for tests
module.exports = {
  removeLegacyIE8Sass,
  appSassPath,
  libSassPath,
  appSassPatternsPath,
  libSassPatternsPath
}
