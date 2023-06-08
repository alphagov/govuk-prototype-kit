const https = require('https')
const zlib = require("zlib")
const tar = require('tar-stream')
const {startPerformanceTimer, endPerformanceTimer} = require("./performance")
const path = require("path")
const {tmpDir} = require("./paths")
const {exists, readJson, ensureDir, writeJson} = require("fs-extra")

async function getConfigForPackage(packageName) {
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

function requestHttpsJson (url) {
  return new Promise((resolve, reject) => {
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
  const extract = tar.extract();
  const data = [];

  extract.on('entry', function (header, stream, cb) {
    stream.on('data', function (chunk) {
      if (header.name === options.fileToFind) {
        data.push(chunk.toString())
      }
    })
  })

  extract.on('finish', function () {
    const result = data.join('');
    if (options.prepare) {
      resolve(options.prepare(result))
    } else {
      resolve(result)
    }
  })

  response
    .pipe(zlib.createGunzip())
    .pipe(extract)
})

module.exports = {
  requestHttpsJson,
  getConfigForPackage
}
