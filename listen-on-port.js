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
    // console.log('NOTICE: the kit is for building prototypes, do not use it for production services.')
    // console.log('')
    console.log('The Prototype Kit is now running at:')
    console.log('http://localhost:3000')
    console.log('')
    console.log('You can access the settings at:')
    console.log('http://localhost:3000/manage-prototype')
    console.log('')

    if (env === 'production' || useBrowserSync === 'false') {
      server.listen(port)
    } else {
      server.listen(port - 50, function () {
        browserSync({
          proxy: 'localhost:' + (port - 50),
          port: port,
          ui: false,
          files: ['public/**/*.*', 'app/views/**/*.*', 'app/assets/**/*.*'],
          ghostMode: false,
          open: false,
          notify: false,
          logLevel: 'error'
        })
      })
    }
  })
}
