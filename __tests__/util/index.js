const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const os = require('os')
const path = require('path')

const tar = require('tar')

const repoDir = path.resolve(__dirname, '..', '..')

var _worktreeCommit

/**
 * An ID that will be shared between all process in the same Jest test run,
 * this is useful for sharing fixture files. Normally sharing state across Jest
 * test files is bad practice, however with our functions to create release
 * scripts that can take up to half a minute we really do want to share state.
 */
function getJestId () {
  return `jest.${process.env.KIT_JEST_RUN_ID || process.ppid}`
}

/**
 * Returns the temporary directory path for this Jest test run
 *
 * @returns {string}
 */
function mkdtempSync () {
  const tempdir = path.join(os.tmpdir(), getJestId())
  fs.mkdirSync(tempdir, { recursive: true })
  return tempdir
}

/**
 * Get a git stash entry representing the current worktree
 *
 * Returns a string which is a commit object ID.
 *
 * @returns {string}
 */
function getWorktreeCommit () {
  if (_worktreeCommit === undefined) {
    // TODO: git stash create doesn't pick up unstaged files
    // TODO: git stash create isn't deterministic, commit ID changes even if stashed files haven't
    _worktreeCommit = child_process.execSync(
      'git stash create',
      { cwd: repoDir, encoding: 'utf8' }
    ).trim() || child_process.execSync(
      // if stash create returned nothing, that means there were no changes to
      // stash and no new commit was created, so instead use the HEAD commit id
      'git rev-parse HEAD',
      { cwd: repoDir, encoding: 'utf8' }
    ).trim()
  }

  return _worktreeCommit
}

/**
 * Return a path to the release archive for the current git worktree
 *
 * Creates a release archive from the git HEAD for the project we are currently
 * running tests in. This will include uncommitted changes for tracked files, but
 * not untracked changes.
 *
 * @param {Object} [options]
 * @param {string} [options.archiveType=tar] - The type of archive to make, tar or zip
 * @param {string} [options.dir] - The folder to place the archive in, by default is a fixture folder in the temporary directory
 * @returns {string} - The absolute path to the archive
 */
function mkReleaseArchiveSync ({ archiveType = 'tar', dir } = {}) {
  dir = dir || path.join(mkdtempSync(), '__fixtures__')
  const commitRef = getWorktreeCommit()
  const name = `govuk-prototype-kit-${commitRef}`
  const archive = path.format({ dir, name, ext: '.' + archiveType })

  fs.mkdirSync(dir, { recursive: true })

  try {
    fs.accessSync(archive)
  } catch (err) {
    child_process.execSync(
      `node scripts/create-release-archive --releaseName ${commitRef} --destDir ${dir} --archiveType ${archiveType} ${commitRef}`,
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
 * @param {Object} [options]
 * @param {string} [options.archivePath] - Path to archive to use to create prototype, if not provided uses mkReleaseArchiveSync
 * @returns {void}
 */
function mkPrototypeSync (prototypePath, { archivePath, overwrite = false } = {}) {
  if (!overwrite && fs.existsSync(prototypePath)) {
    const err = new Error(`path already exists '${prototypePath}'`)
    err.path = prototypePath
    err.code = 'EEXIST'
    throw err
  }

  archivePath = archivePath || mkReleaseArchiveSync()

  fs.mkdirSync(prototypePath, { recursive: true })

  tar.extract({ cwd: prototypePath, file: archivePath, strip: 1, sync: true })
}

module.exports = {
  mkdtempSync,
  mkReleaseArchiveSync,
  mkPrototypeSync
}
