const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const os = require('os')
const path = require('path')

const repoDir = path.resolve(__dirname, '..', '..')

var _releaseVersion

/**
 * Returns the temporary directory path for this jest process
 *
 * @returns {string}
 */
function mkdtempSync () {
  const tempdir = path.join(os.tmpdir(), `jest.${process.ppid}.${process.pid}`)
  fs.mkdirSync(tempdir, { recursive: true })
  return tempdir
}

/**
 * Return a string representing the current git index version
 *
 * @returns {string}
 */
function getReleaseVersion () {
  if (_releaseVersion === undefined) {
    _releaseVersion = child_process.execSync(
      'git rev-parse HEAD',
      { cwd: repoDir, encoding: 'utf8' }
    ).trim()
  }
  return _releaseVersion
}

/**
 * Return a path to the release archive for the current git index
 *
 * Creates a release archive from the git HEAD for the project we are currently
 * running tests in.
 *
 * @returns {string}
 */
function mkReleaseArchiveSync () {
  const dir = path.join(mkdtempSync(), '__fixtures__')
  const name = `govuk-prototype-kit-${getReleaseVersion()}`
  const archive = path.format({ dir, name, ext: '.zip' })

  fs.mkdirSync(dir, { recursive: true })

  try {
    fs.accessSync(archive)
  } catch (err) {
    child_process.execSync(
      `git archive --prefix=${name}/ --output=${archive} HEAD`,
      { cwd: repoDir }
    )
  }

  return archive
}

/**
 * Create a test prototype from the current release archive
 *
 * Creates a prototype at `prototypePath`.
 *
 * @param {string} prototypePath
 */
function mkPrototypeSync (prototypePath) {
  const archivePath = mkReleaseArchiveSync()
  const releaseDir = path.parse(archivePath).name

  const parentDir = path.dirname(prototypePath)
  const name = path.basename(prototypePath)

  child_process.execSync(`unzip -q ${archivePath}`, { cwd: parentDir })
  child_process.execSync(`mv ${releaseDir} ${name}`, { cwd: parentDir })
}

module.exports = {
  mkdtempSync,
  mkReleaseArchiveSync,
  mkPrototypeSync
}
