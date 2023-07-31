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
const extract = require('extract-zip')
const https = require('https')

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

const validateExtractedVersion = async fullFilename => {
  // Retrieve the name and version from the package.json from the extracted zip file
  const extractFolder = path.resolve(fullFilename.substring(0, fullFilename.lastIndexOf('.zip')))
  log(`validating extract => ${extractFolder}`)
  const data = fs.readFileSync(path.join(extractFolder, 'package.json'))
  const { name, version } = JSON.parse(data)
  // Retrieve the directory name of the extracted files
  const separator = (extractFolder.indexOf('/') > -1) ? '/' : '\\'
  const dirname = extractFolder.substring(extractFolder.lastIndexOf(separator) + 1)
  // Make sure they match
  if (`${name}-${version}` !== dirname) {
    throw new Error(`Extracted folder ${extractFolder} contains wrong version in package.json >> ${name}-${version}`)
  }
}

const downloadsFolder = path.resolve('cypress', 'downloads')

module.exports = function setupNodeEvents (on, config) {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  config.env.password = process.env.PASSWORD
  config.env.projectFolder = path.resolve(process.env.KIT_TEST_DIR || process.cwd())
  config.env.tempFolder = path.join(__dirname, '..', 'temp')
  config.env.skipPluginActionInterimStep = process.env.SKIP_PLUGIN_ACTION_INTERIM_STEP

  const packagePath = path.join(config.env.projectFolder, 'package.json')
  const packageContent = fs.readFileSync(packagePath, 'utf8')
  const packageObject = JSON.parse(packageContent)
  const dependencies = packageObject.dependencies || {}

  if ('govuk-prototype-kit' in dependencies) {
    config.env.packageFolder = path.join(config.env.projectFolder, 'node_modules', 'govuk-prototype-kit')
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

  const deleteFolder = (folder, timeout = 0) => fsp.rmdir(folder, { recursive: true })
    .then(() => sleep(timeout))
    .catch((err) => err.code !== 'ENOENT' ? err : null
    )

  const download = async (url, zipFile) => {
    return new Promise((resolve, reject) => {
      log(`downloading => ${url}`)
      const request = https.get(url, response => {
        if (response.statusCode === 200) {
          const filename = path.join(downloadsFolder, zipFile)
          log(`writing => ${filename}`)
          const file = fs.createWriteStream(filename, { flags: 'wx' })
          file.on('finish', () => resolve(filename))
          file.on('error', (err) => {
            file.close()
            fs.unlink(downloadsFolder, () => {
              log(`writing => ${filename} => ${err.message}`)
              reject(err.message)
            }) // Delete temp file
          })
          response.pipe(file)
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Recursively follow redirects, only a 200 will resolve.
          const { location } = response.headers
          if (!zipFile && location.endsWith('.zip')) {
            const uri = new URL(location)
            zipFile = uri.pathname.split('/').pop()
          }
          return download(location, zipFile).then((filename) =>
            resolve(filename))
        } else {
          reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`))
        }
      })

      request.on('error', err => {
        reject(err.message)
      })
    })
  }

  const getPathFromProjectRoot = (...all) => path.join(...[config.env.projectFolder].concat(all))
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
    const projectDir = path.join(config.env.projectFolder)
    const backupDir = path.join(config.env.tempFolder, 'backupStarterFiles')

    // Define the filter function
    const filter = (dir) => !dir.includes('node_modules') && !dir.includes('package-lock.json')

    return fse.emptyDir(backupDir)
      // Copy the files using the filter
      .then(() => fse.copy(projectDir, backupDir, { filter }))
      .then(makeSureCypressCanInterpretTheResult)
  }

  const restoreStarterFiles = async (remainingRetries = 4) => {
    try {
      const tmpDir = path.join(config.env.projectFolder, '.tmp')
      const appDir = path.join(config.env.projectFolder, 'app')
      const backupDir = path.join(config.env.tempFolder, 'backupStarterFiles')
      const projectDir = path.join(config.env.projectFolder)

      const originalPackageJsonHash = await getFileHash(path.join(backupDir, 'package.json'))
      const currentPackageJsonHash = await getFileHash(path.join(projectDir, 'package.json'))

      // Copy the files
      await fse.emptyDir(tmpDir)
      await fse.emptyDir(appDir)
      await fse.copy(backupDir, projectDir)
      if (originalPackageJsonHash !== currentPackageJsonHash) {
        log('Restoring to starter plugins')
        const command = 'npm prune && npm install'
        await exec(command, { cwd: config.env.projectFolder })
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
      const dest = path.join(config.env.projectFolder, filename)
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

    download: async ({ filename }) => {
      log(`deleting folder => ${downloadsFolder}`)
      return deleteFolder(downloadsFolder, 2000)
        .then(() => fsp.mkdir(downloadsFolder, { recursive: true }))
        .then(() => download(filename))
        .then((fullFilename) => {
          log(`extracting => ${fullFilename}`)
          return extract(fullFilename, { dir: downloadsFolder })
            .then(() => {
              return validateExtractedVersion(fullFilename)
            })
        })
        .then(makeSureCypressCanInterpretTheResult)
    },

    addToConfigJson: (additionalConfig) => {
      log(`Adding config JSON => ${downloadsFolder}`)
      const appConfigPath = path.join(config.env.projectFolder, 'app', 'config.json')
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
    }
  })

  return config
}
