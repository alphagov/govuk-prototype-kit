const https = require('https')

function requestHttpsJson (url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const dataParts = []

      const statusCode = res.statusCode

      if (statusCode < 200 || statusCode >= 300) {
        const error = new Error(`Bad response from [${url}]`)
        error.statusCode = statusCode
        error.code = 'EBADRESPONSE'
        reject(error)
      }
      res.on('end', () => {
        const data = dataParts.join('')
        if (data.startsWith('{')) {
          resolve(JSON.parse(data))
        } else {
          resolve()
        }
      })
      res.on('data', (d) => {
        dataParts.push(d)
      })
    }).on('error', (e) => {
      reject(e)
    })
  })
}

module.exports = {
  requestHttpsJson
}
