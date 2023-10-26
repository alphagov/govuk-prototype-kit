// npm dependencies
const { runErrorServer } = require('./lib/errorServer')
const { verboseLog } = require('./lib/utils/verboseLogger')

const config = require('./lib/config.js').getConfig(null, false)

try {
  // local dependencies
  const syncChanges = require('./lib/sync-changes')
  const server = require('./server.js')
  const { generateAssetsSync } = require('./lib/build')

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
        syncChanges.sync({
          port,
          proxyPort,
          files: ['.tmp/public/**/*.*', 'app/views/**/*.*', 'app/assets/**/*.*', 'app/config.json']
        })
      })
    }
  }
} catch (e) {
  if (config.isDevelopment) {
    verboseLog('************************ STARTING ERROR SERVER ***************************')
    runErrorServer(e)
  } else {
    throw e
  }
}
