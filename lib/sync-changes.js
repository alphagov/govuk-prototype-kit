// core dependencies
const EventEmitter = require('events')
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

async function sync ({ port, files }) {
  const server = new EleventyDevServer('govuk-prototype-kit', projectDir, {
    port,
    portReassignmentRetryCount: 0,
    watch: files,
    domDiff: false,
    logger: {
      info: () => {},
      log: () => {},
      error: console.error
    }
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
