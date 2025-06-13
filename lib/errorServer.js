const path = require('path')
const fs = require('fs')

const { getNunjucksAppEnv } = require('./nunjucks/nunjucksConfiguration')
const { getErrorModel } = require('./utils/errorModel')
const { verboseLog } = require('./utils/verboseLogger')
const { packageDir, projectDir } = require('./utils/paths')
const { govukFrontendPaths } = require('./govukFrontendPaths')
const syncChanges = require('./sync-changes')
const { flagError } = require('./sync-changes')
const config = require('./config.js')

function runErrorServer (error) {
  flagError(error)
  let port

  verboseLog('- - - Raw Error Start - - -')
  verboseLog(JSON.stringify({ message: error.message, stack: error.stack }))
  verboseLog('- - - Raw Error End - - -')

  try {
    port = config.getConfig().port
  } catch (e) {
    port = process.env.PORT || 3000
  }
  const proxyPort = port - 50
  const http = require('http')
  const fileExtensionsToMimeTypes = {
    css: 'text/css',
    ico: 'image/x-icon',
    js: 'text/javascript',
    map: 'application/json',
    mjs: 'text/javascript',
    png: 'image/png',
    svg: 'image/svg+xml',
    woff: 'application/font-woff',
    woff2: 'application/font-woff2'
  }

  const managePrototypeCssFilename = path.join(process.cwd(), '.tmp', 'public', 'stylesheets', 'manage-prototype.css')

  const knownPaths = {
    '/public/stylesheets/manage-prototype.css': {
      type: 'text/css',
      contents: fs.existsSync(managePrototypeCssFilename) ? fs.readFileSync(managePrototypeCssFilename) : ''
    }
  }

  // Find GOV.UK Frontend (via internal package, project fallback)
  const govukFrontendInternal = govukFrontendPaths([packageDir, projectDir])

  /**
   * @type {http.RequestListener}
   */
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

    for (const knownRoute of [
      '/manage-prototype/dependencies/',
      '/plugin-assets/'
    ]) {
      if (!req.url.startsWith(knownRoute)) {
        continue
      }

      const filePath = req.url.split(knownRoute).at(-1)
      const fileExtension = filePath.split('.').at(-1)

      res.setHeader('Content-Type', fileExtensionsToMimeTypes[fileExtension] || 'text/plain')

      // Route GOV.UK Frontend to internal package
      const modulesDir = filePath.startsWith('govuk-frontend/') && knownRoute.startsWith('/manage-prototype/')
        ? path.dirname(govukFrontendInternal.baseDir)
        : path.join(process.cwd(), 'node_modules')

      try {
        const contents = fs.readFileSync(path.join(modulesDir, filePath))
        res.writeHead(200)
        res.end(contents)
      } catch (e) {
        console.log('Couldn\'t load url in error server: ', req.url)
        res.writeHead(500)
        res.end('500 Server Error')
      }

      return
    }

    res.setHeader('Cookies', '')
    res.setHeader('Content-Type', 'text/html')
    res.writeHead(500)

    const fileContentsParts = []

    try {
      const nunjucksAppEnv = getNunjucksAppEnv(
        [path.join(__dirname, 'nunjucks')],
        govukFrontendInternal // Add GOV.UK Frontend paths to Nunjucks views
      )

      // Set `govukRebrand` based on app config
      nunjucksAppEnv.addGlobal('govukRebrand', config.getConfig()?.plugins?.['govuk-frontend']?.rebrand)

      res.end(nunjucksAppEnv.render('views/error-handling/server-error', {
        govukFrontendInternal, // Add GOV.UK Frontend paths to Nunjucks context
        ...getErrorModel(error)
      }))
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
