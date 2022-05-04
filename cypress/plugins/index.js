/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
// const spawn = require('child_process').spawn
const fs = require('fs')
const fsp = fs.promises
const path = require('path')

const waitOn = require('wait-on')
const extract = require('extract-zip')
const https = require('https')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  config.env.projectFolder = path.resolve(process.env.KIT_TEST_DIR || process.cwd())
  config.env.tempFolder = path.join(__dirname, '..', 'temp')

  const packagePath = path.join(config.env.projectFolder, 'package.json')
  const packageContent = fs.readFileSync(packagePath, 'utf8')
  const packageObject = JSON.parse(packageContent)
  const dependencies = packageObject.dependencies || {}

  if ('govuk-prototype-kit' in dependencies) {
    config.env.packageFolder = path.join(config.env.projectFolder, 'node_modules', 'govuk-prototype-kit')
  }

  const waitUntilAppRestarts = async (timeout) => await waitOn({ delay: 2000, resources: [config.baseUrl], timeout })
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

  on('task', {
    copyFile: ({ source, target }) => createFolderForFile(target)
      .then(() => fsp.copyFile(source, target))
      // The sleep of 2 seconds allows for the file to be copied completely to prevent
      // it from not existing when the file is needed in a subsequent step
      .then(() => sleep(2000)) // pause after the copy
      .then(makeSureCypressCanInterpretTheResult),

    createFile: ({ filename, data, replace = false }) => createFolderForFile(filename)
      .then(() => fsp.writeFile(filename, data, {
        flag: replace ? 'w' : '' // Flag of w will overwrite
      }))
      .then(makeSureCypressCanInterpretTheResult),

    appendFile: ({ filename, data }) => fsp.appendFile(filename, data)
      .then(makeSureCypressCanInterpretTheResult),

    deleteFile: ({ filename, timeout }) => deleteFile(filename, timeout)
      .then(makeSureCypressCanInterpretTheResult),

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

    log: (message) => {
      log(message)
      return makeSureCypressCanInterpretTheResult()
    }
  })

  return config
}
