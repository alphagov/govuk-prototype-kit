const fs = require('fs')
const os = require('os')
const path = require('path')

const {
  repoDir,
  copyReleaseFiles,
  cleanPackageJson,
  updatePackageJson,
  archiveReleaseFiles
} = require('./util')

function createReleaseArchive (
  archiveType, destDir, releaseName, ref, { verbose } = {}
) {
  const name = `govuk-prototype-kit-${releaseName}`
  const releaseArchive = `${name}.${archiveType}`

  const workdir = fs.mkdtempSync(
    path.join(os.tmpdir(), `govuk-prototype-kit--release-${releaseName}`)
  )

  if (verbose) console.debug(workdir)

  copyReleaseFiles(repoDir, workdir, { prefix: name, ref: ref })

  // Make the changes we want to make
  // Currently just removing dev stuff from package.json
  if (verbose) console.log('Updating package.json')
  updatePackageJson(path.join(workdir, name, 'package.json'), cleanPackageJson)

  // Create the release archive in destDir
  fs.mkdirSync(destDir, { recursive: true }) // ensure destDir exists
  archiveReleaseFiles({
    cwd: workdir, file: path.join(destDir, releaseArchive), prefix: name
  })

  // Clean up
  fs.rmdirSync(workdir, { recursive: true })

  return releaseArchive
}

module.exports = {
  createReleaseArchive
}
