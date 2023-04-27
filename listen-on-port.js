
// npm dependencies
const browserSync = require('browser-sync')

// local dependencies
const server = require('./server.js')
const { generateAssetsSync } = require('./lib/build')
const config = require('./lib/config.js').getConfig()

const port = config.port

generateAssetsSync()

if (config.isTest) {
  server.listen()
} else {
  if (config.isDevelopment) {
    console.log('You can manage your prototype at:')
    console.log(`http://localhost:${port}/manage-prototype`)
    console.log('')
  }
  console.log('The Prototype Kit is now running at:')
  console.log(`http://localhost:${port}`)
  console.log('')

  if (config.isProduction || !config.useBrowserSync) {
    server.listen(port)
  } else {
    server.listen(port - 50, () => {
      browserSync({
        proxy: 'localhost:' + (port - 50),
        port,
        ui: false,
        files: ['.tmp/public/**/*.*', 'app/views/**/*.*', 'app/assets/**/*.*', 'app/config.json'],
        ghostMode: false,
        open: false,
        notify: false,
        logLevel: 'error'
      })
    })
  }
}
