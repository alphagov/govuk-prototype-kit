const fs = require('fs')
const fsp = require('fs').promises
const os = require('os')
const path = require('path')

const {
  repoDir,
  copyReleaseFiles,
  copyReleaseFilesSync,
  cleanPackageJson,
  updatePackageJson,
  updatePackageJsonSync,
  archiveReleaseFiles,
  archiveReleaseFilesSync
} = require('./util')

async function createReleaseArchive (
  { archiveType, destDir, releaseName, ref, verbose = false } = {}
) {
  const name = `govuk-prototype-kit-${releaseName}`
  const releaseArchive = `${name}.${archiveType}`

  const workdir = await fsp.mkdtemp(
    path.join(os.tmpdir(), `govuk-prototype-kit--release-${releaseName}`)
  )

  if (verbose) console.debug(workdir)

  await copyReleaseFiles(repoDir, workdir, { prefix: name, ref: ref })

  // Make the changes we want to make
  // Currently just removing dev stuff from package.json
  if (verbose) console.log('Updating package.json')
  await updatePackageJson(path.join(workdir, name, 'package.json'), cleanPackageJson, { verbose })

  // Create the release archive in destDir
  await fsp.mkdir(destDir, { recursive: true }) // ensure destDir exists
  await archiveReleaseFiles({
    cwd: workdir, file: path.join(destDir, releaseArchive), prefix: name, verbose
  })

  // Clean up
  await fsp.rmdir(workdir, { recursive: true })

  return releaseArchive
}

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
  createReleaseArchive,
  createReleaseArchiveSync
}
