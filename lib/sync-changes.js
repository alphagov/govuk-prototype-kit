// dependencies
const EventEmitter = require('events')

// npm dependencies
const browserSync = require('browser-sync')

const eventEmitter = new EventEmitter()

const pageLoadedEvent = 'sync-changes:page-loaded'

function pageLoaded () {
  eventEmitter.emit(pageLoadedEvent)
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
        // Repeat browser sync reload every 1000 milliseconds until it is successful
        const intervalId = setInterval(browserSync.reload, 1000)
        eventEmitter.once(pageLoadedEvent, () => {
          bs.events.once('browser:reload', () => {
            clearInterval(intervalId)
          })
        })
      }
    }
  })
}

module.exports = {
  sync,
  pageLoaded
}
