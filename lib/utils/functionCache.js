const fs = require('fs')
const fsp = fs.promises
const fse = require('fs-extra')
const config = require('../config')
const path = require('path')

function cacheFunctionCalls (fn, options = {}) {
  const stored = {}
  const loadResponsePromise = options.persistance?.load || ((signature) => stored[signature])
  const savePromise = options.persistance?.save || ((signature, promise) => { stored[signature] = promise })
  const remove = options.persistance?.remove || ((signature) => { delete stored[signature] })
  return async function () {
    if (config.getConfig().turnOffFunctionCaching) {
      return await fn.apply(null, arguments)
    }
    const signature = Buffer.from(JSON.stringify([...arguments])).toString('base64')
    const response = loadResponsePromise(signature)
    if (response) {
      return await response
    }
    await savePromise(signature, fn.apply(null, arguments))
    if (options.maxTimeMinutes) {
      setTimeout(() => {
        remove(signature)
      }, options.maxTimeMinutes * 60 * 1000)
    }
    return await loadResponsePromise(signature)
  }
}

function createFSCache (getCachePath) {
  const accessOnce = {}
  return {
    save: async (signature, promise) => {
      const fileLocation = getCachePath(signature)
      fse.ensureDir(path.dirname(fileLocation))
      const value = await promise
      if (value) {
        await fsp.writeFile(fileLocation, JSON.stringify({ value })).catch(x => {
          console.error('error writing to FS cache', signature)
          console.error(x)
        })
      } else {
        accessOnce[signature] = value
      }
    },
    load: (signature) => {
      const fileLocation = getCachePath(signature)
      if (accessOnce[signature]) {
        delete accessOnce[signature]
        return accessOnce[signature]
      }
      if (fs.existsSync(fileLocation)) {
        return fsp.readFile(fileLocation).then(x => JSON.parse(x)?.value)
      }
    },
    delete: async (signature) => {
      const fileLocation = getCachePath(signature)
      if (await fse.exists(fileLocation)) {
        await fsp.rm(fileLocation)
      }
    }
  }
}

module.exports = {
  cacheFunctionCalls,
  createFSCache
}
