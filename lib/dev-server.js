
// node dependencies
const path = require('path')

// npm dependencies
const chokidar = require('chokidar')
const colour = require('ansi-colors')
const fse = require('fs-extra')
const nodemon = require('nodemon')

// local dependencies
const { generateAssetsSync, generateCssSync } = require('./build')
const plugins = require('./plugins/plugins')
const { collectDataUsage } = require('./usage-data')
const utils = require('./utils')
const {
  packageDir,
  projectDir,

  appDir,
  appSassDir,

  publicCssDir
} = require('./utils/paths')

// Build watch and serve
async function runDevServer () {
  await collectDataUsage()

  generateAssetsSync()
  await utils.waitUntilFileExists(path.join(publicCssDir, 'application.css'), 5000)

  const port = await (new Promise((resolve) => utils.findAvailablePort(resolve)))

  watchBeforeStarting()
  const nodemon = await runNodemon(port)
  watchAfterStarting(nodemon)
}

function watchSass (sassPath) {
  if (!fse.existsSync(sassPath)) return
  chokidar.watch(sassPath, {
    ignoreInitial: true,
    disableGlobbing: true // Prevents square brackets from being mistaken for globbing characters
  }).on('all', () => {
    generateCssSync()
  })
}

function watchBeforeStarting () {
  watchSass(appSassDir)
}

function watchAfterStarting (nodemon) {
  plugins.watchPlugins(({ missing, added }) => {
    generateAssetsSync()
    if (missing.length) {
      console.log(`Removed ${missing.join(', ')}`)
    }
    if (added.length) {
      console.log(`Added ${added.join(', ')}`)
    }
    nodemon.emit('restart')
  })
}

function runNodemon (port) {
  // Let user know about restarts
  // We also rely on this in acceptance tests
  const onRestart = () => {
    console.log('Restarting kit...')
  }
  // Warn about npm install on crash
  const onCrash = () => {
    console.log(colour.cyan('[nodemon] For missing modules try running `npm install`'))
  }

  const onQuit = () => {
    console.log('quit')
    process.exit(0)
  }

  // set PORT so listen-on-port.js knows
  process.env.PORT = port

  return nodemon({
    watch: [
      path.join(projectDir, '.env'),
      path.join(appDir, '**', '*.js'),
      path.join(appDir, '**', '*.json')
    ],
    script: path.join(packageDir, 'listen-on-port.js'),
    ignore: [
      'app/assets/*'
    ]
  })
    .on('restart', onRestart)
    .on('crash', onCrash)
    .on('quit', onQuit)
}

module.exports = {
  runDevServer
}
