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
    console.log('The Prototype Kit is now running at:')
    console.log(`http://localhost:${port}`)
    console.log('')
    console.log('You can access the settings at:')
    console.log(`http://localhost:${port}/manage-prototype`)
    console.log('')

    if (config.isProduction || !config.useBrowserSync) {
      server.listen(port)
    } else {
      server.listen(port - 50, function () {
        browserSync({
          proxy: 'localhost:' + (port - 50),
          port: port,
          ui: false,
          files: ['.tmp/public/**/*.*', 'app/views/**/*.*', 'app/assets/**/*.*', 'app/config.json'],
          ghostMode: false,
          open: false,
          notify: false,
          logLevel: 'error'
        })
      })
    }
  })
}
