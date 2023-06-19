const https = require('https')
const zlib = require("zlib")
const tar = require('tar-stream')

function setupRequestFunction(prepareFn) {
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

module.exports = {
  requestHttpsJson: setupRequestFunction((options, response, resolve) => {
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
  }),
  findFileInHttpsTgz: setupRequestFunction((options, response, resolve) => {
    const extract = tar.extract();
    const data = [];

    extract.on('entry', function(header, stream, cb) {
      stream.on('data', function(chunk) {
        if (header.name == options.fileToFind) {
          data.push(chunk.toString())
        }
      })

      stream.on('end', function() {
        cb()
      })

      stream.resume()
    })

    extract.on('finish', function() {
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
}
