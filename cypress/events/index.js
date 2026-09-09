/// <reference types="cypress" />
// ***********************************************************************************************
// The setupNodeEvents function is where node events can be registered and config can be modified.
// This takes the place of the (removed) pluginFile option.
//
// You can read more here:
// https://docs.cypress.io/guides/references/configuration#setupNodeEvents
// ***********************************************************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// core dependencies
const fs = require('fs')
const fsp = fs.promises
const fse = require('fs-extra')
const path = require('path')

// npm dependencies
const waitOn = require('wait-on')

// local dependencies
const { starterDir } = require('../../lib/utils/paths')
const { sleep } = require('../e2e/utils')
const { requestHttpsJson } = require('../../lib/utils/requestHttps')
const { getFileHash } = require('../../migrator/file-helpers')
const { exec } = require('../../lib/exec')

const log = (message) => console.log(`${new Date().toLocaleTimeString()} => ${message}`)

const createFolderForFile = async (filepath) => {
  const dir = filepath.substring(0, filepath.lastIndexOf('/'))
  if (dir && !fs.existsSync(dir)) {
    await fsp.mkdir(dir, {
      recursive: true
    })
  }
}

module.exports = function setupNodeEvents (on, config) {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  config.expose.password = process.env.PASSWORD
  config.expose.additionalPasswords = (process.env.PASSWORD_KEYS || '')
    .split(',')
    .map(passwordKey => process.env[passwordKey.trim()])
    .filter(password => !!password)
  config.expose.projectFolder = path.resolve(process.env.KIT_TEST_DIR || process.cwd())
  config.expose.tempFolder = path.join(__dirname, '..', 'temp')

  const packagePath = path.join(config.expose.projectFolder, 'package.json')
  const packageContent = fs.readFileSync(packagePath, 'utf8')
  const packageObject = JSON.parse(packageContent)
  const dependencies = packageObject.dependencies || {}

  if ('govuk-prototype-kit' in dependencies) {
    config.expose.packageFolder = path.join(config.expose.projectFolder, 'node_modules', 'govuk-prototype-kit')
  }

  const waitUntilAppRestarts = (timeout = 20000) => waitOn({
    delay: 3000,
    resources: [config.baseUrl],
    timeout
  })
  const getReplacementText = async (text, source) => source ? fsp.readFile(source) : text
  const replaceText = ({ text, originalText, newText, source }) => {
    return getReplacementText(newText, source)
      .then((replacementText) => {
        if (text.includes(originalText)) {
          return text.replace(originalText, replacementText)
        } else {
          throw new Error('Text to be replaced not found')
        }
      })
  }

  const replaceMultipleText = async (text, list) => {
    let resultText = text
    let index = 0
    while (index < list.length) {
      resultText = await replaceText({ text: resultText, ...list[index] })
      index++
    }
    return resultText
  }

  const makeSureCypressCanInterpretTheResult = () => null

  const existsFile = (filename, timeout = 0) => fsp.access(filename)
    .then(makeSureCypressCanInterpretTheResult)
    .catch((err) => err.code !== 'ENOENT'
      ? err
      : async () => {
        if (timeout < 100) {
          return null
        } else {
          await sleep(100)
          return existsFile(filename, timeout - 100)
        }
      }
    )

  const notExistsFile = (filename, timeout = 0) => fsp.access(filename)
    .then(async () => {
      if (timeout < 100) {
        return makeSureCypressCanInterpretTheResult()
      } else {
        await sleep(100)
        return notExistsFile(filename, timeout - 100)
      }
    })
    .catch((err) => err.code !== 'ENOENT' ? err : makeSureCypressCanInterpretTheResult())

  const deleteFile = (filename, timeout = 0) => fsp.unlink(filename)
    .then(() => sleep(timeout))
    .catch((err) => err.code !== 'ENOENT' ? err : null
    )

  const getPathFromProjectRoot = (...all) => path.join(...[config.expose.projectFolder].concat(all))
  const pathToPackageFile = packageName => getPathFromProjectRoot('node_modules', packageName, 'package.json')

  const pluginInstalled = async (plugin, version, timeout) => {
    const delay = 1000

    if (version === '@latest') {
      const packageInfo = await requestHttpsJson(`https://registry.npmjs.org/${encodeURIComponent(plugin)}`)
      const { latest } = packageInfo['dist-tags']
      version = '@' + latest
    }

    const retry = async () => {
      log(`Will retry in ${delay} milliseconds`)
      await sleep(delay)
      await pluginInstalled(plugin, version, timeout - delay)
    }

    return new Promise((resolve) => {
      const pkgFilePath = pathToPackageFile(plugin)
      log(`Waiting for ${pkgFilePath} to exist`)
      return existsFile(pkgFilePath, timeout).then(() => {
        if (version) {
          const packageContent = fs.readFileSync(pkgFilePath, 'utf8')
          const { version: currentVersion } = JSON.parse(packageContent)
          log(`Current version of ${plugin} is @${currentVersion}`)
          if (version === '@' + currentVersion) {
            resolve(makeSureCypressCanInterpretTheResult)
          } else {
            retry().then(() => resolve(makeSureCypressCanInterpretTheResult))
          }
        } else {
          log('Skip version test')
          resolve(makeSureCypressCanInterpretTheResult)
        }
      })
    })
  }

  const backupStarterFiles = () => {
    const projectDir = path.join(config.expose.projectFolder)
    const backupDir = path.join(config.expose.tempFolder, 'backupStarterFiles')

    // Define the filter function
    const filter = (dir) => !dir.includes('node_modules') && !dir.includes('package-lock.json')

    return fse.emptyDir(backupDir)
      // Copy the files using the filter
      .then(() => fse.copy(projectDir, backupDir, { filter }))
      .then(makeSureCypressCanInterpretTheResult)
  }

  const restoreStarterFiles = async (remainingRetries = 4) => {
    try {
      const tmpDir = path.join(config.expose.projectFolder, '.tmp')
      const appDir = path.join(config.expose.projectFolder, 'app')
      const appViewsDir = path.join(appDir, 'views')
      const appDataDir = path.join(appDir, 'data')
      const appAssetsDir = path.join(appDir, 'assets')
      const appSassDir = path.join(appAssetsDir, 'sass')
      const appJSDir = path.join(appAssetsDir, 'javascripts')
      const backupDir = path.join(config.expose.tempFolder, 'backupStarterFiles')
      const projectDir = path.join(config.expose.projectFolder)

      const originalPackageJsonHash = await getFileHash(path.join(backupDir, 'package.json'))
      const currentPackageJsonHash = await getFileHash(path.join(projectDir, 'package.json'))

      // Delete the files
      await Promise.all([
        tmpDir,
        appViewsDir,
        appDataDir,
        appJSDir,
        appSassDir
      ].map(async dir => fse.emptyDir(dir)))

      // Copy the files
      await fse.copy(backupDir, projectDir)
      if (originalPackageJsonHash !== currentPackageJsonHash) {
        log('Restoring to starter plugins')
        const command = 'npm prune && npm install'
        await exec(command, { cwd: config.expose.projectFolder })
        await sleep(1000)
        // To allow for possible SASS recompilation, wait again
        await waitUntilAppRestarts()
        await sleep(1000)
        log(`Completed ${command}`)
      }
      await waitUntilAppRestarts()
      return makeSureCypressCanInterpretTheResult()
    } catch (error) {
      if (remainingRetries > 0) {
        remainingRetries = typeof remainingRetries === 'number' ? remainingRetries - 1 : 0
        await sleep(1000)
        log('Trying again')
        return restoreStarterFiles(remainingRetries)
      } else {
        console.error(JSON.stringify({ error }, null, 2))
      }
    }
  }

  on('before:browser:launch', backupStarterFiles)

  on('task', {
    copyFile: ({ source, target }) => createFolderForFile(target)
      .then(() => fsp.copyFile(source, target))
      // The sleep of 2 seconds allows for the file to be copied completely to prevent
      // it from not existing when the file is needed in a subsequent step
      .then(() => sleep(2000)) // pause after the copy
      .then(makeSureCypressCanInterpretTheResult),

    copyFromStarterFiles: ({ starterFilename = undefined, filename }) => {
      const src = path.join(starterDir, starterFilename || filename)
      const dest = path.join(config.expose.projectFolder, filename)
      return createFolderForFile(dest)
        .then(() => fsp.copyFile(src, dest))
        // The sleep of 2 seconds allows for the file to be copied completely to prevent
        // it from not existing when the file is needed in a subsequent step
        .then(() => sleep(2000)) // pause after the copy
        .then(makeSureCypressCanInterpretTheResult)
    },

    createFile: ({ filename, data, replace = false }) => createFolderForFile(filename)
      .then(() => fsp.writeFile(filename, data, {
        flag: replace ? 'w' : '' // Flag of w will overwrite
      }))
      .then(makeSureCypressCanInterpretTheResult),

    appendFile: ({ filename, data }) => fsp.appendFile(filename, data)
      .then(makeSureCypressCanInterpretTheResult),

    deleteFile: ({ filename, timeout }) => deleteFile(filename, timeout)
      .then(makeSureCypressCanInterpretTheResult),

    existsFile: ({ filename, timeout }) => existsFile(filename, timeout)
      .then(makeSureCypressCanInterpretTheResult),

    notExistsFile: ({ filename, timeout }) => notExistsFile(filename, timeout)
      .then(makeSureCypressCanInterpretTheResult),

    pluginInstalled: ({ plugin, version, timeout }) => pluginInstalled(plugin, version, timeout)
      .then(makeSureCypressCanInterpretTheResult),

    pluginUninstalled: ({ plugin, timeout }) => {
      const pkgFilePath = pathToPackageFile(plugin)
      return notExistsFile(pkgFilePath, timeout)
        .then(makeSureCypressCanInterpretTheResult)
    },

    waitUntilAppRestarts: (config) => {
      const { timeout = 20000 } = config || {}
      return waitUntilAppRestarts(timeout)
        .then(makeSureCypressCanInterpretTheResult)
    },

    replaceTextInFile: ({ filename, ...options }) => fsp.readFile(filename)
      .then((buffer) => replaceText({ text: buffer.toString(), ...options }))
      .then((text) => fsp.writeFile(filename, text.toString()))
      .then(makeSureCypressCanInterpretTheResult),

    replaceMultipleTextInFile: ({ filename, list }) => fsp.readFile(filename)
      .then((buffer) => replaceMultipleText(buffer.toString(), list))
      .then((text) => fsp.writeFile(filename, text.toString()))
      .then(makeSureCypressCanInterpretTheResult),

    addToConfigJson: (additionalConfig) => {
      const appConfigPath = path.join(config.expose.projectFolder, 'app', 'config.json')
      log(`Adding config JSON => ${appConfigPath}`)
      return fse.readJson(appConfigPath)
        .then(existingConfig => Object.assign({}, existingConfig, additionalConfig))
        .then(newConfig => fse.writeJson(appConfigPath, newConfig))
        .then(makeSureCypressCanInterpretTheResult)
    },

    restoreStarterFiles: () => {
      log('Restoring to starter files')
      return restoreStarterFiles()
        .then(makeSureCypressCanInterpretTheResult)
    },

    log: (message) => {
      log(message)
      return makeSureCypressCanInterpretTheResult()
    },

    exec: (command) => {
      return exec(command, { cwd: config.expose.projectFolder })
    }
  })

  return config
}
