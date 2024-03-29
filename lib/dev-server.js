// node dependencies
const path = require('path')

// npm dependencies
const chokidar = require('chokidar')
const colour = require('ansi-colors')
const fse = require('fs-extra')
const nodemon = require('nodemon')
let nodemonInstance

// local dependencies
const {
  generateAssetsSync,
  generateCssSync,
  proxyUserSassIfItExists,
  setNodemonInstance
} = require('./build')
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
  let startupError

  try {
    generateAssetsSync()
    generateCssSync()
    await utils.waitUntilFileExists(path.join(publicCssDir, 'application.css'), 5000)
  } catch (err) {
    startupError = err
  }

  const port = await (new Promise((resolve) => utils.findAvailablePort(resolve)))

  await runNodemon(port)
  watchAfterStarting()

  if (startupError && nodemonInstance) {
    nodemonInstance.emit('restart')
  }
}

function proxyAndGenerateCssSync (fullFilename, state) {
  const filename = fullFilename.split(path.sep).pop().toLowerCase()
  if (filename === 'settings.scss') {
    proxyUserSassIfItExists(filename)
    generateCssSync(state)
  }
}

function watchSass (sassPath) {
  if (!fse.existsSync(sassPath)) return
  chokidar.watch(sassPath, {
    ignoreInitial: true,
    awaitWriteFinish: true,
    disableGlobbing: true // Prevents square brackets from being mistaken for globbing characters
  }).on('add', proxyAndGenerateCssSync)
    .on('unlink', proxyAndGenerateCssSync)
    .on('all', generateCssSync)
}

function watchAfterStarting () {
  watchSass(appSassDir)

  plugins.watchPlugins(({ missing, added }) => {
    if (missing.length) {
      console.log(`Removed ${missing.join(', ')}`)
    }
    if (added.length) {
      console.log(`Added ${added.join(', ')}`)
    }
    nodemonInstance.emit('restart')
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
    ],
    delay: 2000 // debounce multiple restarts in quick succession
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
  nodemonInstance = nodemon(nodemonSettings)
    .on('restart', onRestart)
    .on('crash', onCrash)
    .on('quit', onQuit)

  setNodemonInstance(nodemonInstance)

  endPerformanceTimer('runDevServer', timer)

  logPerformanceSummaryOnce()
}

module.exports = {
  runDevServer
}
