const path = require('path')
const fs = require('fs')
const { projectDir, packageDir } = require('../path-utils')
const appSassPath = path.join(projectDir, 'app', 'assets', 'sass')
const appSassPatternsPath = path.join(appSassPath, 'patterns')
const applicationScssPath = path.join(appSassPath, 'application.scss')
const libSassPath = path.join(packageDir, 'lib', 'assets', 'sass')
const libSassPatternsPath = path.join(libSassPath, 'patterns')
const ie8SassFiles = [
  'application-ie8.scss',
  'unbranded-ie8.scss'
]

function removeKitSassFromApplicationSass () {
  const oldComment = '// Add extra styles here, or re-organise the Sass files in whichever way makes most sense to you'
  const newComment = '// Add extra styles here'
  try {
    const contents = fs.readFileSync(applicationScssPath, { encoding: 'utf-8' })
    const lines = contents.split('\n')
    const commentLineNumber = lines.findIndex(line => line.includes(oldComment))
    if (commentLineNumber !== -1) {
      lines.splice(0, commentLineNumber + 1)
      fs.writeFileSync(applicationScssPath, `${newComment}\n${lines.join('\n')}`)
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

module.exports = {
  removeKitSassFromApplicationSass,
  removeKitSassFromAppSassPath,
  removeLegacyIE8Sass,
  appSassPath,
  libSassPath,
  appSassPatternsPath,
  libSassPatternsPath
}
