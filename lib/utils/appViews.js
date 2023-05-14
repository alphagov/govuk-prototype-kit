const fse = require('fs-extra')
const path = require('path')
const { projectDir, finalBackupNunjucksDir, packageDir } = require('./paths')
const plugins = require('../plugins/plugins')

let internalGovukFrontendDir

function getInternalGovukFrontendDir () {
  if (!internalGovukFrontendDir) {
    const packageDirFrontend = path.join(packageDir, 'node_modules', 'govuk-frontend')
    const projectDirFrontend = path.join(projectDir, 'node_modules', 'govuk-frontend')
    internalGovukFrontendDir = fse.pathExistsSync(packageDirFrontend) ? packageDirFrontend : projectDirFrontend
  }
  return internalGovukFrontendDir
}

function getAppViews () {

  const additionalViews = []
  const internalViews = getInternalGovukFrontendDir()
  if (internalViews) {
    additionalViews.push(internalViews)
  }
  additionalViews.push(finalBackupNunjucksDir)
  return [
    path.join(projectDir, '/app/views/')
  ].concat(plugins.getAppViews(additionalViews))
}

module.exports = {
  getInternalGovukFrontendDir,
  getAppViews
}
