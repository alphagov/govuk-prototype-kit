
// core dependencies
const os = require('os')
const path = require('path')

// npm dependencies
const fs = require('fs-extra')

// local dependencies
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
  npmInstallLinks = undefined,
  commandLineParameters = ''
} = {}) { // TODO: Use kitPath if provided
  if (fs.existsSync(prototypePath)) {
    if (!overwrite) {
      const err = new Error(`path already exists '${prototypePath}'`)
      err.path = prototypePath
      err.code = 'EEXIST'
      throw err
    } else {
      await fs.remove(prototypePath)
    }
  }

  process.stderr.write(`Creating test prototype at ${prototypePath}\n`)

  const execEnv = { ...process.env, env: 'test' }
  if (npmInstallLinks !== undefined) {
    // make sure that any packages installed from folders are installed fully (not as symlinks)
    execEnv.npm_config_install_links = npmInstallLinks ? 'true' : 'false'
  }

  const startTime = Date.now()

  try {
    // Generate starter project
    const repoDir = path.resolve(__dirname, '..', '..')
    await exec(
      `"${process.execPath}" bin/cli create --version local ${commandLineParameters} ${prototypePath}`,
      { cwd: repoDir, env: execEnv, stdio: 'inherit' }
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

  if (npmInstallLinks !== undefined) {
    // setting an environment variable is fine for the install above, but to
    // ensure future npm commands don't reorganise the node_modules folder, let's
    // save the config variables to the project npmrc
    await exec(
      `npm config --location=project set install-links=${npmInstallLinks ? 'true' : 'false'}`,
      { cwd: prototypePath }
    )
  }
}

async function installPlugins (prototypePath, pluginNames) {
  let pluginNamesProcessed = pluginNames || []
  if (!Array.isArray(pluginNames)) {
    pluginNamesProcessed = [pluginNames]
  }
  return exec(
    `npm install ${pluginNamesProcessed.join(' ')} --save-exact`,
    { cwd: prototypePath, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
  )
}

async function startPrototype (prototypePath, nodeEnv = 'development') {
  return exec(
    nodeEnv === 'production' ? 'npm start' : 'npm run dev',
    { cwd: prototypePath, env: { USE_AUTH: 'false', USE_HTTPS: 'false', ...process.env, env: 'test' }, stdio: 'inherit' }
  )
}

module.exports = {
  mkdtempSync,
  mkPrototype,
  startPrototype,
  installPlugins
}
