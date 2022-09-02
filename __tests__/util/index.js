const child_process = require('child_process') // eslint-disable-line camelcase

const fs = require('fs-extra')
const os = require('os')
const path = require('path')

const { packageDir: repoDir } = require('../../lib/path-utils')

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
 * Create a test prototype from the current release archive
 *
 * Creates a prototype at `prototypePath`.
 *
 * @param {string} prototypePath
 * @param {Object} [options]
 * @param {string} [options.kitPath] - Path to the kit to use when creating prototype, if not provided uses mkReleaseArchive
 * @param {bool} [options.allowTracking] - If undefined no usage-data-config.json is created,
 *                                         if true a usage-data-config.json is created allowing tracking,
 *                                         if false a usage-data-config.json is crated disallowing tracking
 * @returns {void}
 */
async function mkPrototype (prototypePath, {
  kitPath,
  overwrite = false,
  allowTracking = undefined,
  extensions = ['govuk-frontend'],
  additionalExtensions = []
} = {}) { // TODO: Use kitPath if provided
  if (fs.existsSync(prototypePath)) {
    if (!overwrite) {
      const err = new Error(`path already exists '${prototypePath}'`)
      err.path = prototypePath
      err.code = 'EEXIST'
      throw err
    } else {
      fs.rmdir(prototypePath, { recursive: true })
    }
  }

  try {
    // Remove previous test starter project
    await fs.remove(prototypePath)

    // Create test starter project folder
    await fs.mkdirp(prototypePath)

    await fs.writeJson(
      path.join(prototypePath, 'package.json'),
      { dependencies: { 'govuk-prototype-kit': `file:${repoDir}` } }
    )

    // Generate starter project and start
    child_process.execSync(
      `node bin/cli install -- ${prototypePath}`,
      { env: { ...process.env, env: 'test' }, stdio: 'inherit' }
    )

    if (allowTracking !== undefined) {
      await fs.writeFile(path.join(prototypePath, 'usage-data-config.json'), `{ "collectUsageData": ${allowTracking}}`)
    }
  } catch (error) {
    console.error(error.message)
    console.error(error.stack)
    if (error.status > 0) {
      process.exitCode = error.status
    }
  }
}

function installExtensions (prototypePath, extensionNames) {
  let extensionNamesProcessed = extensionNames || []
  if (!Array.isArray(extensionNames)) {
    extensionNamesProcessed = [extensionNames]
  }
  child_process.execSync(
    `npm install ${extensionNamesProcessed.join(' ')}`,
    { cwd: prototypePath, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
  )
}

function npmInstall (pathToRunInstallIn) {
  return child_process.exec(
    'npm install',
    { cwd: pathToRunInstallIn, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
  )
}

function startPrototype (prototypePath) {
  child_process.execSync(
    'npm start',
    { cwd: prototypePath, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
  )
}

module.exports = {
  mkdtemp,
  npmInstall,
  mkdtempSync,
  mkPrototype,
  startPrototype,
  installExtensions
}
