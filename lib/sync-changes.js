// dependencies
const EventEmitter = require('events')

// npm dependencies
const browserSync = require('browser-sync')
const { writeJsonSync, ensureDir } = require('fs-extra')
const path = require('path')
const { tmpDir } = require('./utils/paths')
const fs = require('fs')

const eventEmitter = new EventEmitter()

const pageLoadedEvent = 'sync-changes:page-loaded'

const errorsFile = path.join(tmpDir, 'errors.json')

function hasRestartedAfterError () {
  return fs.existsSync(errorsFile)
}

function flagError (error) {
  ensureDir(tmpDir)
  writeJsonSync(path.join(tmpDir, 'errors.json'), { error })
}

function unflagError () {
  if (fs.existsSync(errorsFile)) {
    try {
      fs.unlinkSync(errorsFile)
    } catch (_) {}
  }
}

function pageLoaded () {
  if (hasRestartedAfterError()) {
    eventEmitter.emit(pageLoadedEvent)
  }
  return { status: 'received ok' }
}

function sync ({ port, proxyPort, files }) {
  browserSync({
    ws: true,
    proxy: 'localhost:' + proxyPort,
    port,
    ui: false,
    files,
    ghostMode: false,
    open: false,
    notify: false,
    logLevel: 'error',
    callbacks: {
      ready: (_, bs) => {
        if (hasRestartedAfterError()) {
          // Repeat browser sync reload every 1000 milliseconds until it is successful
          const intervalId = setInterval(browserSync.reload, 1000)
          eventEmitter.once(pageLoadedEvent, () => {
            bs.events.once('browser:reload', () => {
              if (hasRestartedAfterError()) {
                unflagError()
              }
              clearInterval(intervalId)
            })
          })
        }
      }
    }
  })
}

module.exports = {
  sync,
  flagError,
  pageLoaded,
  hasRestartedAfterError
}
