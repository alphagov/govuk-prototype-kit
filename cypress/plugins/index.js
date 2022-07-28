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

const { sleep } = require('../integration/utils')

const createFolderForFile = async (filepath) => {
  const dir = filepath.substring(0, filepath.lastIndexOf('/'))
  if (dir && !fs.existsSync(dir)) {
    await fsp.mkdir(dir, {
      recursive: true
    })
  }
}

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

    deleteFile: ({ filename, timeout }) => fsp.unlink(filename)
      .then(() => sleep(timeout))
      .then(makeSureCypressCanInterpretTheResult)
      .catch((err) => err.code !== 'ENOENT' ? err : null
      ),

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

    log: (message) => {
      console.log(`${new Date().toLocaleTimeString()} => ${message}`)
      return makeSureCypressCanInterpretTheResult()
    }
  })

  return config
}
