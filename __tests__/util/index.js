const os = require('os')
const path = require('path')

const fs = require('fs-extra')

const { exec } = require('../../lib/exec')

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

function getKitTestDir () {
  return path.resolve(
    process.env.KIT_TEST_DIR ||
    path.join(os.tmpdir(), 'govuk-prototype-kit-test')
  )
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
  allowTracking = undefined
} = {}) { // TODO: Use kitPath if provided
  if (fs.existsSync(prototypePath)) {
    if (!overwrite) {
      const err = new Error(`path already exists '${prototypePath}'`)
      err.path = prototypePath
      err.code = 'EEXIST'
      throw err
    } else {
      fs.remove(prototypePath)
    }
  }

  process.stderr.write(`Creating test prototype at ${prototypePath}\n`)

  const startTime = Date.now()

  try {
    // Generate starter project
    const repoDir = path.resolve(__dirname, '..', '..')
    await exec(
      `"${process.execPath}" bin/cli create --version local ${prototypePath}`,
      { cwd: repoDir, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
    )

    if (allowTracking !== undefined) {
      await fs.writeJson(path.join(prototypePath, 'usage-data-config.json'), { collectUsageData: !!allowTracking })
    }

    process.stderr.write(`Kit creation took [${Math.round((Date.now() - startTime) / 100) / 10}] seconds\n`)
  } catch (error) {
    console.error(error.message)
    console.error(error.stack)
    if (error.status > 0) {
      process.exitCode = error.status
    }
  }
}

async function installExtensions (prototypePath, extensionNames) {
  let extensionNamesProcessed = extensionNames || []
  if (!Array.isArray(extensionNames)) {
    extensionNamesProcessed = [extensionNames]
  }
  return exec(
    `npm install ${extensionNamesProcessed.join(' ')}`,
    { cwd: prototypePath, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
  )
}

async function npmInstall (pathToRunInstallIn) {
  return exec(
    'npm install',
    { cwd: pathToRunInstallIn, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
  )
}

async function startPrototype (prototypePath) {
  return exec(
    'npm run dev',
    { cwd: prototypePath, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
  )
}

module.exports = {
  getKitTestDir,
  mkdtemp,
  npmInstall,
  mkdtempSync,
  mkPrototype,
  startPrototype,
  installExtensions
}
