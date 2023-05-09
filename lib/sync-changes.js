// npm dependencies
const browserSync = require('browser-sync')

module.exports = ({ port, proxyPort, files }) => {
  browserSync({
    proxy: 'localhost:' + proxyPort,
    port,
    ui: false,
    files,
    ghostMode: false,
    open: false,
    notify: false,
    logLevel: 'error',
    callbacks: {
      ready: async () => {
        // Force browser sync to reload to catch any changes during the restart after 250 milliseconds
        setTimeout(browserSync.reload, 250)
        // Reload again at 1 second and then 6 seconds just in case some are missed on a slower machine as happens in the acceptance tests within Google actions
        setTimeout(browserSync.reload, 1000)
        setTimeout(browserSync.reload, 6000)
      }
    }
  })
}
