const colour = require('nodemon/lib/utils/colour')
const del = require('del')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const chokidar = require('chokidar')

const buildConfig = require('./config.json')
const { paths } = buildConfig

const appSassPath = path.join(paths.assets, 'sass')
const appCssPath = path.join(paths.public, 'stylesheets')

function generateAssets () {
  clean()
  sassExtensions()
  sass(appSassPath, appCssPath)
  copyAssets(paths.assets, paths.public)
}

function runTasks () {
  generateAssets()
  watch()
  runNodemon()
}

function clean () {
  // doesn't clean extensions.scss, should it?
  del.sync(['public/**', '.port.tmp'])
}

function sassExtensions () {
  const extensions = require('../lib/extensions/extensions')
  let fileContents = '$govuk-extensions-url-context: "/extension-assets"; '
  fileContents += extensions.getFileSystemPaths('sass')
    .map(filePath => `@import "${filePath.split(path.sep).join('/')}";`)
    .join('\n')
  fs.writeFileSync(path.join('lib', 'extensions', '_extensions.scss'), fileContents)
}

function sass (sassPath, cssPath) {
  if (!fs.existsSync(sassPath)) return
  console.log('compiling CSS...')
  const sass = require('sass')
  fs.mkdirSync(cssPath, { recursive: true })
  fs.readdirSync(sassPath).forEach(file => {
    if (!file.endsWith('.scss')) return

    try {
      const result = sass.compile(`${sassPath}/${file}`, {
        logger: sass.Logger.silent,
        loadPaths: [__dirname],
        sourceMap: true,
        style: 'expanded'
      })

      const cssFilename = file.replace('.scss', '.css')
      fs.writeFileSync(`${cssPath}/${cssFilename}`, result.css)
    } catch (err) {
      console.error(err.message)
      console.error(err.stack)
    }
  })
}

function copyAssets (sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) return
  console.log('copying assets...')
  const filterFunc = (src) => !src.startsWith(path.join(sourcePath, 'sass'))

  // shouldnt have to mkdir, but copy errors with EEXIST otherwise
  fse.ensureDirSync(targetPath, { recursive: true })
  fse.copySync(sourcePath, targetPath, { filter: filterFunc })
}

function watchSass (sassPath, cssPath) {
  if (!fs.existsSync(sassPath)) return
  chokidar.watch(sassPath, {
    ignoreInitial: true
  }).on('all', (event, path) => {
    console.log(`watch ${sassPath}`)
    console.log(event, path)
    sass(sassPath, cssPath)
  })
}

function watchAssets (sourcePath, targetPath) {
  chokidar.watch([
    path.join(sourcePath, '**'),
    `!${path.join(sourcePath, 'sass', '**')}`
  ], {
    ignoreInitial: true
  }).on('all', (event, path) => {
    console.log(`watch ${sourcePath}`)
    console.log(event, path)
    copyAssets(sourcePath, targetPath)
  })
}

function watch () {
  watchSass(appSassPath, appCssPath)
  watchAssets(paths.assets, paths.public)
}

function runNodemon () {
  const nodemon = require('nodemon')

  // Warn about npm install on crash
  const onCrash = () => {
    console.log(colour.cyan('[nodemon] For missing modules try running `npm install`'))
  }

  // Remove .port.tmp if it exists
  const onQuit = () => {
    try {
      fs.unlinkSync(path.join(__dirname, '/../.port.tmp'))
    } catch (e) {}
    console.log('quit')
    process.exit(0)
  }

  nodemon({
    watch: ['.env', '**/*.js', '**/*.json'],
    script: 'listen-on-port.js',
    ignore: [
      'public/*',
      `${paths.assets}*`,
      'node_modules/*'
    ]
  })
    .on('crash', onCrash)
    .on('quit', onQuit)
}

module.exports = {
  runTasks,
  generateAssets
}
