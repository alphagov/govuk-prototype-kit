const https = require('https')
const zlib = require('zlib')
const tar = require('tar-stream')
const { startPerformanceTimer, endPerformanceTimer } = require('./performance')
const path = require('path')
const { tmpDir } = require('./paths')
const { exists, readJson, ensureDir, writeJson } = require('fs-extra')
const {verboseLog} = require("./verboseLogger");

async function getConfigForPackage (packageName) {
  const timer = startPerformanceTimer()

  const cacheFileDirectory = path.join(tmpDir, 'caches')
  const cacheFileReference = path.join(cacheFileDirectory, 'getConfigForPackage.json')
  let cache = {}

  await ensureDir(cacheFileDirectory)
  if (await exists(cacheFileReference)) {
    cache = await readJson(cacheFileReference)
  }

  let registry

  try {
    registry = await requestHttpsJson(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`)
  } catch (e) {
    endPerformanceTimer('getConfigForPackage (bad status)', timer)

    return undefined
  }
  const latestTag = registry['dist-tags']?.latest

  if (cache[packageName] && cache[packageName][latestTag]) {
    endPerformanceTimer('getConfigForPackage (from cache)', timer)
    return cache[packageName][latestTag]
  }

  if (!latestTag) {
    endPerformanceTimer('getConfigForPackage (no latest tag)', timer)
    return
  }

  const url = registry.versions[latestTag].dist.tarball
  try {
    const result = await findFileInHttpsTgz(url, {
      fileToFind: 'package/govuk-prototype-kit.config.json',
      prepare: str => {
        if (str && str.startsWith('{')) {
          const result = JSON.parse(str)
          cache[packageName] = cache[packageName] || {}
          cache[packageName][latestTag] = result
          writeJson(cacheFileReference, cache)
          return result
        }
      }
    })

    endPerformanceTimer('getConfigForPackage', timer)

    return result
  } catch (e) {
    endPerformanceTimer('getConfigForPackage (error-in-findFileInHttpsTgz)', timer)
    return
  }
}

function setupRequestFunction (prepareFn, badStatusFn) {
  return (url, options) => new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const statusCode = response.statusCode

      if (statusCode < 200 || statusCode >= 300) {
        const error = new Error(`Bad response from [${url}]`)
        error.statusCode = statusCode
        error.code = 'EBADRESPONSE'
        reject(error)
      }

      prepareFn(options, response, resolve, reject)
    }).on('error', (e) => {
      reject(e)
    })
  })
}

const requestHttpsJson = setupRequestFunction((options, response, resolve) => {
  const dataParts = []
  response.on('end', () => {
    const data = dataParts.join('')
    if (data.startsWith('{')) {
      resolve(JSON.parse(data))
    } else {
      resolve()
    }
  })
  response.on('data', (d) => {
    dataParts.push(d)
  })
})

const findFileInHttpsTgz = setupRequestFunction((options, response, resolve) => {
  const extract = tar.extract()
  const data = []

  extract.on('entry', function (header, stream, cb) {
    stream.on('data', function (chunk) {
      if (header.name === options.fileToFind) {
        data.push(chunk.toString())
      }
    })

    stream.on('end', function () {
      cb()
    })
    
    stream.on('error', function(e){
      verboseLog('Error from tar.extract stream', e)
    })

    stream.resume()
  })

  extract.on('finish', function () {
    const result = data.join('')
    if (options.prepare) {
      resolve(options.prepare(result))
    } else {
      resolve(result)
    }
  })

  response
    .on('error', (e) => verboseLog('Error from response', e))
    .pipe(zlib.createGunzip().on('error', (e) => verboseLog('Error from gunzip', e)))
    .pipe(extract.on('error', (e) => verboseLog('Error from extract', e)))
    .on('error', function(e){
      verboseLog('Error from within .tgz pipe', e)
    })
})

module.exports = {
  requestHttpsJson,
  getConfigForPackage
}
