
// NPM dependencies
const browserSync = require('browser-sync')

// Local dependencies
const server = require('./server.js')
const config = require('./app/config.js')
const utils = require('./lib/utils.js')

// Set up configuration variables
var useBrowserSync = config.useBrowserSync.toLowerCase()
var env = (process.env.NODE_ENV || 'development').toLowerCase()

utils.findAvailablePort(server, function (port) {
  if (env === 'production' || useBrowserSync === 'false') {
    console.log('Listening on port ' + port + '   url: http://localhost:' + port)
    server.listen(port)
  } else {
    const newPort = port - 50;
    console.log('Listening on port ' + newPort + '   url: http://localhost:' + newPort)
    server.listen(newPort, function () {
      browserSync({
        proxy: 'localhost:' + (newPort),
        port: port,
        ui: false,
        files: ['public/**/*.*', 'app/views/**/*.*'],
        ghostMode: false,
        open: false,
        notify: false,
        logLevel: 'error'
      })
    })
  }
})
