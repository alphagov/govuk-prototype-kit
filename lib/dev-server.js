
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

  publicCssDir,
  portTmpFile
} = require('./utils/paths')

// Build watch and serve
async function runDevServer () {
  await collectDataUsage()

  generateAssetsSync()
  await utils.waitUntilFileExists(path.join(publicCssDir, 'application.css'), 5000)
  watchBeforeStarting()
  const nodemon = await runNodemon()
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
    console.log('Restarting kit')
    nodemon.emit('restart')
  })
}

function runNodemon () {
  // Warn about npm install on crash
  const onCrash = () => {
    console.log(colour.cyan('[nodemon] For missing modules try running `npm install`'))
  }

  // Remove port.tmp if it exists
  const onQuit = () => {
    try {
      fse.unlinkSync(portTmpFile)
    } catch (e) {}
    console.log('quit')
    process.exit(0)
  }

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
    .on('crash', onCrash)
    .on('quit', onQuit)
}

module.exports = {
  runDevServer
}
