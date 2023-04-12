const path = require('path')
const fs = require('fs')

const { getNunjucksAppEnv } = require('./nunjucks/nunjucksConfiguration')

function runErrorServer (error) {
  let port
  try {
    port = require('./config.js').getConfig().port
  } catch (e) {
    port = process.env.PORT || 3000
  }
  const http = require('http')
  const host = 'localhost'

  const fileExtensionsToMimeTypes = {
    js: 'application/javascript',
    css: 'text/css'
  }

  const knownPaths = {
    '/public/stylesheets/unbranded.css': {
      type: 'text/css',
      contents: fs.readFileSync(path.join(process.cwd(), '.tmp', 'public', 'stylesheets', 'unbranded.css'))
    },
    '/public/stylesheets/application.css': {
      type: 'text/css',
      contents: fs.readFileSync(path.join(process.cwd(), '.tmp', 'public', 'stylesheets', 'application.css'))
    }
  }

  const requestListener = function (req, res) {
    if (knownPaths[req.url]) {
      res.setHeader('Content-Type', knownPaths[req.url].type)
      res.writeHead(200)
      res.end(knownPaths[req.url].contents)
      return
    }
    if (req.url.startsWith('/plugin-assets')) {
      res.setHeader('Content-Type', fileExtensionsToMimeTypes[req.url.split('.').at(-1)] || 'text/plain')
      const urlParts = req.url.split('/')
      urlParts.shift()
      urlParts[0] = 'node_modules'
      const filePath = path.join(process.cwd(), ...urlParts)
      res.end(fs.readFileSync(filePath))
      return
    }

    res.setHeader('Cookies', '')
    res.setHeader('Content-Type', 'text/html')
    res.writeHead(500)

    const fileContentsParts = []

    try {
      const nunjucksAppEnv = getNunjucksAppEnv([
        path.join(__dirname, 'nunjucks'),
        path.join(process.cwd(), 'node_modules', 'govuk-frontend')
      ])
      res.end(nunjucksAppEnv.render('views/error-handling/server-error', {
        errorStack: error.stack
      }))
    } catch (ignoreThisError) {
      fileContentsParts.push('<h1 class="govuk-heading-l">There is an error</h1>')
      fileContentsParts.push('<p>')
      fileContentsParts.push('You can try and fix this yourself or <a class="govuk-link" href="https://prototype-kit.service.gov.uk/docs/support">contact the GOV.UK Prototype Kit team</a> if you need help.')
      fileContentsParts.push('</p>')
      fileContentsParts.push('<pre><code>')
      fileContentsParts.push(error.stack)
      fileContentsParts.push('</code></pre>')
    }
    res.end(fileContentsParts.join('\n'))
  }

  const server = http.createServer(requestListener)

  server.listen(port, host, () => {
    console.log('')
    console.log('')
    console.log(`There's an error, you can see it below or at http://${host}:${port}`)
    console.log('')
    console.log('')
    console.log('')
    console.log(error)
    console.log('')
    console.log('')
    console.log('')
  })
}

module.exports = {
  runErrorServer
}
