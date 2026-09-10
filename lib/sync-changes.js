// core dependencies
const EventEmitter = require('events')
const http = require('http')
const path = require('path')
const util = require('util')
const fs = require('fs')

// npm dependencies
const { ensureDirSync, writeJsonSync } = require('fs-extra')
// ESM-only package, `require()` of ESM needs Node 22.12 or newer
const eleventyDevServerModule = require('@11ty/eleventy-dev-server')
const EleventyDevServer = eleventyDevServerModule.default || eleventyDevServerModule

// local dependencies
const { tmpDir, projectDir } = require('./utils/paths')

const eventEmitter = new EventEmitter()

const pageLoadedEvent = 'sync-changes:page-loaded'

const errorsFile = path.join(tmpDir, 'errors.json')

function hasRestartedAfterError () {
  return fs.existsSync(errorsFile)
}

function flagError (error) {
  const errorFormatted = util.inspect(error, {
    compact: false,
    depth: Infinity,
    maxArrayLength: Infinity,
    maxStringLength: Infinity
  })

  ensureDirSync(path.dirname(errorsFile))
  writeJsonSync(errorsFile, { error: errorFormatted })
}

function unflagError () {
  if (fs.existsSync(errorsFile)) {
    fs.unlinkSync(errorsFile)
  }
}

function pageLoaded () {
  if (hasRestartedAfterError()) {
    eventEmitter.emit(pageLoadedEvent)
  }
  return { status: 'received ok' }
}

// Headers that must not be forwarded between the client and the kit server
const hopByHopHeaders = ['connection', 'keep-alive', 'transfer-encoding']

// Proxies a single request to the kit's server running on proxyPort.
// HTML responses are passed on as strings so the dev server can inject its
// live reload client, other content types are passed on as buffers.
function proxyRequest (proxyPort, req, res) {
  const requestChunks = []
  req.on('data', chunk => requestChunks.push(chunk))
  req.on('end', () => {
    const requestBody = Buffer.concat(requestChunks)
    const headers = {
      ...req.headers,
      host: `localhost:${proxyPort}`,
      'accept-encoding': 'identity'
    }
    for (const header of [...hopByHopHeaders, 'content-length']) {
      delete headers[header]
    }
    if (requestBody.length > 0) {
      headers['content-length'] = requestBody.length
    }

    const proxyReq = http.request({
      hostname: 'localhost',
      port: proxyPort,
      path: req.url,
      method: req.method,
      headers
    }, proxyRes => {
      const responseChunks = []
      proxyRes.on('data', chunk => responseChunks.push(chunk))
      proxyRes.on('end', () => {
        const responseBody = Buffer.concat(responseChunks)

        for (const [key, value] of Object.entries(proxyRes.headers)) {
          if ([...hopByHopHeaders, 'content-length', 'content-encoding'].includes(key)) {
            continue
          }
          res.setHeader(key, value)
        }
        res.statusCode = proxyRes.statusCode

        const contentType = proxyRes.headers['content-type'] || ''
        if (contentType.startsWith('text/')) {
          res.end(responseBody.toString('utf8'))
        } else {
          res.end(responseBody)
        }
      })
    })
    proxyReq.on('error', () => {
      res.statusCode = 502
      res.end('Could not connect to the Prototype Kit server')
    })
    proxyReq.end(requestBody.length > 0 ? requestBody : undefined)
  })
}

async function sync ({ port, proxyPort, files }) {
  const server = new EleventyDevServer('govuk-prototype-kit', projectDir, {
    port,
    portReassignmentRetryCount: 0,
    watch: files,
    domDiff: false,
    logger: {
      info: () => {},
      log: () => {},
      error: console.error
    },
    middleware: [
      (req, res) => proxyRequest(proxyPort, req, res)
    ]
  })

  server.serve(port)

  await server.ready()

  if (hasRestartedAfterError()) {
    // Repeat dev server reload every 1000 milliseconds until it is successful
    const intervalId = setInterval(() => server.reload(), 1000)
    eventEmitter.once(pageLoadedEvent, () => {
      // A new websocket connection means the browser has reloaded
      server.updateServer.once('connection', () => {
        if (hasRestartedAfterError()) {
          unflagError()
        }
        clearInterval(intervalId)
      })
    })
  }
}

module.exports = {
  sync,
  flagError,
  pageLoaded,
  hasRestartedAfterError
}
