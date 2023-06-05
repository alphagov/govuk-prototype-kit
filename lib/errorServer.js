const path = require('path')
const fs = require('fs')

const { getNunjucksAppEnv } = require('./nunjucks/nunjucksConfiguration')
const { getErrorModel } = require('./utils/errorModel')
const { verboseLog } = require('./utils/verboseLogger')
const syncChanges = require('./sync-changes')
const { flagError } = require('./sync-changes')

function runErrorServer (error) {
  flagError(error)
  let port

  verboseLog('- - - Raw Error Start - - -')
  verboseLog(JSON.stringify({ message: error.message, stack: error.stack }))
  verboseLog('- - - Raw Error End - - -')

  try {
    port = require('./config.js').getConfig().port
  } catch (e) {
    port = process.env.PORT || 3000
  }
  const proxyPort = port - 50
  const http = require('http')
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
    if (req.url.startsWith('/browser-sync')) {
      return
    }
    if (req.url.startsWith('/manage-prototype/page-loaded')) {
      const result = syncChanges.pageLoaded()
      res.end(JSON.stringify(result))
      return
    }
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
      res.end(nunjucksAppEnv.render('views/error-handling/server-error', getErrorModel(error)))
    } catch (ignoreThisError) {
      console.log(JSON.stringify({ ignoreThisError }, null, 2))
      fileContentsParts.push('<h1 class="govuk-heading-l">There is an error</h1>')
      fileContentsParts.push('<p>')
      fileContentsParts.push('You can try and fix this yourself or <a class="govuk-link" href="https://prototype-kit.service.gov.uk/docs/support">contact the GOV.UK Prototype Kit team</a> if you need help.')
      fileContentsParts.push('</p>')
      fileContentsParts.push('<pre><code>')
      fileContentsParts.push(error.stack)
      fileContentsParts.push('</code></pre>')

      const refreshScript = `
        <script>
            const sendPageLoadedRequest = function () {
                fetch('/manage-prototype/page-loaded').catch(() => {
                    setTimeout(sendPageLoadedRequest, 500)
                })
            }
            sendPageLoadedRequest()
        </script>
    `
      res.end(fileContentsParts.join('\n') + refreshScript)
    }
  }

  const server = http.createServer(requestListener)

  server.listen(proxyPort, () => {
    console.log('')
    console.log('')
    console.log(`There's an error, you can see it below or at http://localhost:${port}`)
    console.log('')
    console.log('')
    console.log('')
    console.log(error)
    console.log('')
    console.log('')
    console.log('')
    syncChanges.sync({
      port,
      proxyPort,
      files: ['app/**/*.*']
    })
  })
}

module.exports = {
  runErrorServer
}
