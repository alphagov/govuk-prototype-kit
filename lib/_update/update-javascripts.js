const fs = require('fs').promises
const path = require('path')

const { getProjectVersion, patchUserFile } = require('./util')
const { projectDir } = require('../path-utils')

async function updateJavascripts () {
  // Delete any old shared files
  const appJsPath = path.join(projectDir, 'app', 'assets', 'javascripts')
  await fs.unlink(path.join(appJsPath, 'auto-store-data.js')).catch(() => {})
  await fs.unlink(path.join(appJsPath, 'jquery-1.11.3.js')).catch(() => {})
  await fs.unlink(path.join(appJsPath, 'step-by-step-nav.js')).catch(() => {})
  await fs.unlink(path.join(appJsPath, 'step-by-step-navigation.js')).catch(() => {})

  const userVersion = await getProjectVersion()

  // If the user already has version 13 or greater of the kit installed then
  // their application.js file is all their code and we don't don't want to
  // change it
  if (userVersion >= '13.0.0') {
    return
  }

  await patchUserFile(userVersion, 'app/assets/javascripts/application.js')
}

module.exports = {
  /* exported for tests only */
  updateJavascripts
}

if (require.main === module) {
  updateJavascripts()
}
