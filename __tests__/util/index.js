const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const os = require('os')
const path = require('path')

const lockfile = require('proper-lockfile')
const tar = require('tar')

const { createReleaseArchive, createReleaseArchiveSync } = require('../../internal_lib/create-release-archive')

const repoDir = path.resolve(__dirname, '..', '..')

var _worktreeCommit = process.env.KIT_JEST_WORKTREE_COMMIT || undefined

/**
 * An ID that will be shared between all process in the same Jest test run,
 * this is useful for sharing fixture files. Normally sharing state across Jest
 * test files is bad practice, however with our functions to create release
 * scripts that can take up to half a minute we really do want to share state.
 */
function getJestId () {
  return `jest.${process.env.KIT_JEST_RUN_ID || process.ppid}`
}

function _mkdtempPath () {
  return path.join(os.tmpdir(), getJestId())
}

/**
 * Returns the temporary directory path for this Jest test run
 *
 * @returns {string}
 */
async function mkdtemp () {
  const tempdir = _mkdtempPath()
  await fs.promises.mkdir(tempdir, { recursive: true })
  return tempdir
}

/**
 * Synchronous version of `mkdtemp()`.
 *
 * @returns {string}
 */
function mkdtempSync () {
  const tempdir = _mkdtempPath()
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
    // TODO: we shouldn't really be using git for any of this

    // If no files have been changed we can just use the HEAD commit it
    if (child_process.spawnSync('git', ['diff', '--quiet']).status === 0) {
      _worktreeCommit = child_process.execSync(
        'git rev-parse HEAD',
        { cwd: repoDir, encoding: 'utf8' }
      ).trim()
    } else {
      // Otherwise create a stash commit to point to the current worktree
      // TODO: git stash create sometimes fails, and I don't know why
      // TODO: git stash create doesn't pick up unstaged files
      // TODO: git stash create isn't deterministic, commit ID changes even if stashed files haven't
      _worktreeCommit = child_process.execSync(
        'git stash create',
        { cwd: repoDir, encoding: 'utf8' }
      ).trim()
    }
  }

  return _worktreeCommit
}

function _mkReleaseArchiveOptions ({ archiveType = 'tar', dir, ref } = {}) {
  const destDir = dir || path.join(mkdtempSync(), '__fixtures__')
  const commitRef = ref || getWorktreeCommit()
  const releaseName = ref || (process.env.KIT_JEST_RUN_ID ? getJestId() : commitRef)
  const name = `govuk-prototype-kit-${releaseName}`
  const archive = path.format({ name, dir: destDir, ext: '.' + archiveType })

  return { archive, archiveType, destDir, releaseName, ref: commitRef }
}

/**
 * Return a path to the release archive for a git ref
 *
 * Creates a release archive from the git HEAD for the project we are currently
 * running tests in. This will include uncommitted changes for tracked files, but
 * not untracked changes.
 *
 * @param {Object} [options]
 * @param {string} [options.archiveType=tar] - The type of archive to make, tar or zip
 * @param {string} [options.dir] - The folder to place the archive in, by default is a fixture folder in the temporary directory
 * @param {string} [options.ref] - The branch or tag to archive, defaults to a stash of the worktree
 * @returns {string} - The absolute path to the archive
 */
async function mkReleaseArchive (options) {
  options = _mkReleaseArchiveOptions(options)

  await fs.promises.mkdir(options.destDir, { recursive: true })

  while (!fs.existsSync(options.archive)) {
    try {
      const releaseLock = await lockfile.lock(options.archive, { realpath: false, retries: 5 })
      if (!fs.existsSync(options.archive)) {
        await createReleaseArchive(options)
      }
      await releaseLock()
    } catch (err) {
      continue
    }
  }

  return options.archive
}

/**
 *
 * Synchronous version of `mkReleaseArchive()`.
 *
 * Note: if you call this function five times in quick succession with the
 * same arguments, it will happily start running five process to make the same
 * archive five times. This is usually bad for your computer. If you have
 * multiple processes that need to get the same release archive (such as in for
 * the Jest tests), use the async version.
 *
 * @param {Object} [options]
 * @param {string} [options.archiveType=tar] - The type of archive to make, tar or zip
 * @param {string} [options.dir] - The folder to place the archive in, by default is a fixture folder in the temporary directory
 * @param {string} [options.ref] - The branch or tag to archive, defaults to a stash of the worktree
 * @returns {string} - The absolute path to the archive
 */
function mkReleaseArchiveSync (options) {
  options = _mkReleaseArchiveOptions(options)

  fs.mkdirSync(options.destDir, { recursive: true })

  try {
    fs.accessSync(options.archive)
  } catch (err) {
    createReleaseArchiveSync(options)
  }

  return options.archive
}

/**
 * Create a test prototype from the current release archive
 *
 * Creates a prototype at `prototypePath`.
 *
 * @param {string} prototypePath
 * @param {Object} [options]
 * @param {string} [options.archivePath] - Path to archive to use to create prototype, if not provided uses mkReleaseArchive
 * @returns {void}
 */
async function mkPrototype (prototypePath, { archivePath, overwrite = false } = {}) {
  if (!overwrite && fs.existsSync(prototypePath)) {
    const err = new Error(`path already exists '${prototypePath}'`)
    err.path = prototypePath
    err.code = 'EEXIST'
    throw err
  }

  archivePath = archivePath || await mkReleaseArchive()

  await fs.promises.mkdir(prototypePath, { recursive: true })

  await tar.extract({ cwd: prototypePath, file: archivePath, strip: 1 })
}

/**
 * Synchronous version of `mkPrototype()`
 *
 * See the note in the docstring for `mkReleaseArchive()` for a warning against
 * using this function. Prefer the async version where possible.
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
  getWorktreeCommit,
  mkdtemp,
  mkdtempSync,
  mkReleaseArchive,
  mkReleaseArchiveSync,
  mkPrototype,
  mkPrototypeSync
}
