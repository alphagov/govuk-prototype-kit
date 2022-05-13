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
const waitOn = require('wait-on')
const fs = require('fs')

const { sleep } = require('../integration/utils')
const { hostName } = require('../config')

const waitUntilAppRestarts = async (timeout) => await waitOn({ delay: 2000, resources: [hostName], timeout })

const createFolderForFile = (filepath) => {
  const dir = filepath.substring(0, filepath.lastIndexOf('/'))
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
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

  on('task', {
    copyFile: async ({ source, target, timeout = 2000 }) => {
      try {
        createFolderForFile(target)
        fs.copyFileSync(source, target)
        // The sleep of 2 seconds allows for the file to be copied completely to prevent
        // it from not existing when the file is needed in a subsequent step
        await sleep(2000) // pause after the copy
        return Promise.resolve(null)
      } catch (err) {
        return Promise.reject(err)
      }
    }
  })

  on('task', {
    createFile: async ({ filename, data, replace = false }) => {
      try {
        createFolderForFile(filename)
        fs.writeFileSync(filename, data, {
          flag: replace ? 'w' : '' // Flag of w will overwrite
        })
        return Promise.resolve(null)
      } catch (err) {
        return Promise.reject(err)
      }
    }
  })

  on('task', {
    appendFile: async ({ filename, data }) => {
      try {
        fs.appendFileSync(filename, data)
        return Promise.resolve(null)
      } catch (err) {
        return Promise.reject(err)
      }
    }
  })

  on('task', {
    deleteFile: async ({ filename, timeout }) => {
      try {
        fs.unlinkSync(filename)
        await sleep(timeout)
        return Promise.resolve(null)
      } catch (err) {
        if (err.code !== 'ENOENT') {
          return Promise.reject(err)
        }
        return Promise.resolve(null)
      }
    }
  })

  on('task', {
    waitUntilAppRestarts: async (config) => {
      const { timeout = 20000 } = config || {}
      try {
        await waitUntilAppRestarts(timeout)
        return Promise.resolve(null)
      } catch (err) {
        return Promise.reject(err)
      }
    }
  })

  on('task', {
    log (message) {
      console.log(`${new Date().toLocaleTimeString()} => ${message}`)
      return null
    }
  })
}
