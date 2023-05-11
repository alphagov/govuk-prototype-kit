
// npm dependencies
const { runErrorServer } = require('./lib/errorServer')

try {
  // local dependencies
  const syncChanges = require('./lib/sync-changes')
  const server = require('./server.js')
  const { generateAssetsSync } = require('./lib/build')
  const config = require('./lib/config.js').getConfig(null, false)

  const port = config.port
  const proxyPort = port - 50

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
      server.listen(proxyPort, () => {
        syncChanges({
          port,
          proxyPort,
          files: ['.tmp/public/**/*.*', 'app/views/**/*.*', 'app/assets/**/*.*', 'app/config.json']
        })
      })
    }
  }
} catch (e) {
  runErrorServer(e)
}
