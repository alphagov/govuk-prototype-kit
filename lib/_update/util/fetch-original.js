const https = require('https')

async function fetchOriginal (version, filePath) {
  const remoteUrl = `https://raw.githubusercontent.com/alphagov/govuk-prototype-kit/v${version}/${filePath}`

  let data = ''
  return new Promise((resolve, reject) => {
    https.get(remoteUrl, (response) => {
      let error

      if (response.statusCode !== 200) {
        error = new Error(`could not fetch ${remoteUrl}: status code ${response.statusCode}`)
        Object.assign(error, response)
        response.resume()
        reject(error)
      }

      response.setEncoding('utf8')

      response.on('data', (chunk) => {
        data += chunk
      })

      response.on('end', () => {
        resolve(data)
      })
    })
  })
}

module.exports = {
  fetchOriginal
}
