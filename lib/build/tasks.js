const path = require('path')
const { EOL } = require('os')

const chokidar = require('chokidar')
const colour = require('ansi-colors')
const del = require('del')
const fse = require('fs-extra')
const nodemon = require('nodemon')
const sass = require('sass')

const extensions = require('../extensions/extensions')

const utils = require('../utils')

const buildConfig = require('./config.json')
const { projectDir, packageDir } = require('../path-utils')
const { paths } = buildConfig

const appSassPath = path.join(projectDir, paths.assets, 'sass')
const shadowNunjucks = path.join(projectDir, paths.shadowNunjucks)
const libAssetsPath = path.join(packageDir, paths.libAssets)
const libSassPath = path.join(libAssetsPath, 'sass')
const tempPath = path.join(projectDir, '.tmp')
const tempSassPath = path.join(tempPath, 'sass')

const appCssPath = path.join(paths.public, 'stylesheets')

const appSassOptions = {
  filesToSkip: [
    'application.scss'
  ]
}

const libSassOptions = {
  filesToRename: {
    'prototype.scss': 'application.css'
  }
}

function generateAssetsSync ({ verbose } = {}) {
  clean()
  sassExtensions()
  autoImportComponentsSync()

  generateCss(appSassPath, appCssPath, appSassOptions)
  generateCss(libSassPath, appCssPath, libSassOptions)
}

function devServer () {
  watch()
  return runNodemon()
}

async function buildWatchAndServe () {
  generateAssetsSync()
  await utils.waitUntilFileExists(path.join(appCssPath, 'application.css'), 5000)
  devServer()
}

function clean () {
  // doesn't clean extensions.scss, should it?
  del.sync(['public/**', '.port.tmp'])
}

function sassExtensions () {
  let fileContents = '$govuk-extensions-url-context: "/extension-assets"; '
  fileContents += extensions.getFileSystemPaths('sass')
    .map(filePath => `@import "${filePath.split(path.sep).join('/')}";`)
    .join('\n')
  fse.ensureDirSync(tempSassPath, { recursive: true })
  fse.writeFileSync(path.join(tempPath, '.gitignore'), '*')
  fse.writeFileSync(path.join(tempSassPath, '_extensions.scss'), fileContents)
}

function generateCss (sassPath, cssPath, options = {}) {
  const { filesToSkip = [], filesToRename = {} } = options
  if (!fse.existsSync(sassPath)) return
  fse.mkdirSync(cssPath, { recursive: true })
  fse.readdirSync(sassPath)
    .filter(file => ((file.endsWith('.scss') && !filesToSkip.includes(file))))
    .forEach(file => {
      try {
        const result = sass.compile(path.join(sassPath, file), {
          quietDeps: true,
          loadPaths: [projectDir],
          sourceMap: true,
          style: 'expanded'
        })

        const cssFilename = filesToRename[file] || file.replace('.scss', '.css')
        fse.writeFileSync(path.join(cssPath, cssFilename), result.css)
      } catch (err) {
        console.error(err.message)
        console.error(err.stack)
      }
    })
}

function watchSass (sassPath, generateSassPath, cssPath, options) {
  if (!fse.existsSync(sassPath)) return
  chokidar.watch(sassPath, {
    ignoreInitial: true
  }).on('all', () => {
    generateCss(generateSassPath, cssPath, options)
  })
}

function watch () {
  watchSass(appSassPath, libSassPath, appCssPath, libSassOptions)
  watchSass(appSassPath, appSassPath, appCssPath, appSassOptions)
}

function runNodemon () {
  // Warn about npm install on crash
  const onCrash = () => {
    console.log(colour.cyan('[nodemon] For missing modules try running `npm install`'))
  }

  // Remove .port.tmp if it exists
  const onQuit = () => {
    try {
      fse.unlinkSync(path.join(__dirname, '/../.port.tmp'))
    } catch (e) {}
    console.log('quit')
    process.exit(0)
  }

  return nodemon({
    watch: [
      path.join(projectDir, '.env'),
      path.join(projectDir, '**', '*.js'),
      path.join(projectDir, '**', '*.json')
    ],
    script: path.join(packageDir, 'listen-on-port.js'),
    ignore: [
      'public/*',
      'cypress/*',
      `${paths.assets}/*`,
      'node_modules/*'
    ]
  })
    .on('crash', onCrash)
    .on('quit', onQuit)
}

function autoImportComponentsSync () {
  const includeString = extensions.getByType('nunjucksComponents').map(({
    item: {
      macroName,
      file
    }
  }) => `{% from "${file}" import ${macroName} %}`).join(EOL)

  extensions.getByType('autoImportNunjucksComponents').map(({ packageName, item: templatePath }) => {
    return {
      shadowPath: path.join(shadowNunjucks, packageName, templatePath),
      newContents: [
        includeString,
        fse.readFileSync(path.join(projectDir, 'node_modules', packageName, templatePath), 'utf8')
      ].join(EOL + EOL)
    }
  }).forEach(file => {
    fse.ensureDirSync(path.dirname(file.shadowPath))
    fse.writeFileSync(file.shadowPath, file.newContents, 'utf8')
  })
}

module.exports = {
  buildWatchAndServe,
  devServer,
  generateAssetsSync
}
