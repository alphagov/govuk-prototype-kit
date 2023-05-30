// dependencies
const EventEmitter = require('events')

// npm dependencies
const browserSync = require('browser-sync')
const { writeJsonSync } = require('fs-extra')
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
  writeJsonSync(path.join(tmpDir, 'errors.json'), { error })
}

function unflagError () {
  if (hasRestartedAfterError()) {
    fs.unlinkSync(errorsFile)
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
              unflagError()
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
  pageLoaded
}
