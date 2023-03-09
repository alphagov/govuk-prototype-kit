// node dependencies
const path = require('path')

// npm dependencies
const chokidar = require('chokidar')
const colour = require('ansi-colors')
const fse = require('fs-extra')
const nodemon = require('nodemon')

// local dependencies
const { generateAssetsSync, generateCssSync, proxyUserSassIfItExists } = require('./build')
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
const fs = require('fs')
const { logPerformanceSummaryOnce, startPerformanceTimer, endPerformanceTimer } = require('./utils/performance')

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

function proxyAndGenerateCssSync (fullFilename) {
  const filename = fullFilename.split(path.sep).pop().toLowerCase()
  if (filename === 'settings.scss') {
    proxyUserSassIfItExists(filename)
    generateCssSync()
  }
}

function watchSass (sassPath) {
  if (!fse.existsSync(sassPath)) return
  chokidar.watch(sassPath, {
    ignoreInitial: true,
    disableGlobbing: true // Prevents square brackets from being mistaken for globbing characters
  }).on('add', proxyAndGenerateCssSync)
    .on('unlink', proxyAndGenerateCssSync)
    .on('all', generateCssSync)
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
  const timer = startPerformanceTimer()
  // Let user know about restarts
  // We also rely on this in acceptance tests
  const onRestart = () => {
    console.log('Restarting kit...')
    console.log('')
  }
  // Warn about npm install on crash
  const onCrash = () => {
    console.log(colour.cyan('[nodemon] For missing modules try running `npm install`'))
  }

  const onQuit = () => {
    console.log('quit')
    process.exit(0)
  }

  const nodeModulesPath = path.join(projectDir, 'node_modules')

  const nodemonSettings = {
    watch: [
      path.join(projectDir, '.env'),
      path.join(appDir, '**', '*.js'),
      path.join(appDir, '**', '*.json')
    ],
    script: path.join(packageDir, 'listen-on-port.js'),
    ignore: [
      'app/assets/*'
    ]
  }

  const linkedDependencyDirectories = fs.readdirSync(nodeModulesPath).map(dirName => {
    function getFileInfo (fullPath) {
      return {
        isSymLink: fs.lstatSync(fullPath).isSymbolicLink(),
        fullPath
      }
    }

    const fullPath = path.join(nodeModulesPath, dirName)
    if (dirName.startsWith('@')) {
      return fs.readdirSync(fullPath).map(fileName => {
        const fullPathOfSubDir = path.join(fullPath, fileName)
        return getFileInfo(fullPathOfSubDir)
      })
    }
    return getFileInfo(fullPath)
  })
    .flat()
    .filter(({ isSymLink }) => isSymLink)

  if (linkedDependencyDirectories.length > 0) {
    nodemonSettings.watch.push(...linkedDependencyDirectories.map(({ fullPath }) => [`${fullPath}/**/*.js`, `${fullPath}/**/*.json`]).flat())
    nodemonSettings.ignoreRoot = ['.git']
    linkedDependencyDirectories.forEach(({ fullPath }) => {
      console.log('Watching dependency', fullPath.substring(nodeModulesPath.length + 1), 'as it\'s a symbolic link.')
    })
    console.log()
  }

  // set PORT so listen-on-port.js knows

  process.env.PORT = port
  const nodemonInstance = nodemon(nodemonSettings)
    .on('restart', onRestart)
    .on('crash', onCrash)
    .on('quit', onQuit)

  endPerformanceTimer('runDevServer', timer)

  logPerformanceSummaryOnce()

  return nodemonInstance
}

module.exports = {
  runDevServer
}
