// NPM dependencies
const browserSync = require('browser-sync')

// Local dependencies
const server = require('./server.js')
const config = require('./lib/config.js').getConfig()
const utils = require('./lib/utils.js')

if (process.env.IS_INTEGRATION_TEST === 'true') {
  server.listen()
} else {
  utils.findAvailablePort(server, function (port) {
    console.log('Listening on port ' + port + '   url: http://localhost:' + port)
    if (config.isProduction || !config.useBrowserSync) {
      server.listen(port)
    } else {
      server.listen(port - 50, function () {
        browserSync({
          proxy: 'localhost:' + (port - 50),
          port: port,
          ui: false,
          files: ['public/**/*.*', 'app/views/**/*.*', 'app/assets/**/*.*', 'app/config.json'],
          ghostMode: false,
          open: false,
          notify: false,
          logLevel: 'error'
        })
      })
    }
  })
}
