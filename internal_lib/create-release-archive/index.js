const fs = require('fs')
const os = require('os')
const path = require('path')

const {
  repoDir,
  copyReleaseFilesSync,
  cleanPackageJson,
  updatePackageJsonSync,
  archiveReleaseFilesSync
} = require('./util')

function createReleaseArchiveSync (
  { archiveType, destDir, releaseName, ref, verbose = false } = {}
) {
  const name = `govuk-prototype-kit-${releaseName}`
  const releaseArchive = `${name}.${archiveType}`

  const workdir = fs.mkdtempSync(
    path.join(os.tmpdir(), `govuk-prototype-kit--release-${releaseName}`)
  )

  if (verbose) console.debug(workdir)

  copyReleaseFilesSync(repoDir, workdir, { prefix: name, ref: ref })

  // Make the changes we want to make
  // Currently just removing dev stuff from package.json
  if (verbose) console.log('Updating package.json')
  updatePackageJsonSync(path.join(workdir, name, 'package.json'), cleanPackageJson, { verbose })

  // Create the release archive in destDir
  fs.mkdirSync(destDir, { recursive: true }) // ensure destDir exists
  archiveReleaseFilesSync({
    cwd: workdir, file: path.join(destDir, releaseArchive), prefix: name, verbose
  })

  // Clean up
  fs.rmdirSync(workdir, { recursive: true })

  return releaseArchive
}

module.exports = {
  createReleaseArchiveSync
}
