// NPM dependencies
const browserSync = require('browser-sync')

// Local dependencies
const server = require('./server.js')
const config = require('./lib/config.js')
const utils = require('./lib/utils.js')

// Set up configuration variables
var useBrowserSync = config.useBrowserSync.toLowerCase()
var env = utils.getNodeEnv()

if (process.env.IS_INTEGRATION_TEST === 'true') {
  server.listen()
} else {
  utils.findAvailablePort(server, function (port) {
    const baseUrl = `http://localhost:${port}`
    console.log('The prototype is now running on:')
    console.log(baseUrl)
    console.log('')
    console.log('You can access settings at:')
    console.log(`${baseUrl}/prototype-settings`)
    if (env === 'production' || useBrowserSync === 'false') {
      server.listen(port)
    } else {
      server.listen(port - 50, function () {
        browserSync({
          proxy: 'localhost:' + (port - 50),
          port: port,
          ui: false,
          files: ['public/**/*.*', 'app/views/**/*.*', 'app/assets/**/*.*', 'lib/prototype-admin/**/*.*'],
          ghostMode: false,
          open: false,
          notify: false,
          logLevel: 'error'
        })
      })
    }
  })
}
