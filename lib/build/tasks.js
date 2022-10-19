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
const { projectDir, packageDir, tempDir } = require('../path-utils')
const { paths } = buildConfig

const appCssPath = path.join(projectDir, paths.public, 'stylesheets')
const appSassPath = path.join(projectDir, paths.assets, 'sass')
const shadowNunjucks = path.join(projectDir, paths.shadowNunjucks)
const libAssetsPath = path.join(packageDir, paths.libAssets)
const libSassPath = path.join(libAssetsPath, 'sass')
const tempSassPath = path.join(tempDir, 'sass')

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
  extensions.setExtensionsByType()
  clean()
  sassExtensions()
  autoImportComponentsSync()
  proxyUserSassIfItExists('application.scss')
  proxyUserSassIfItExists('settings.scss')

  generateCss(appSassPath, appCssPath, appSassOptions)
  generateCss(libSassPath, appCssPath, libSassOptions)
}

async function buildWatchAndServe () {
  generateAssetsSync()
  await utils.waitUntilFileExists(path.join(appCssPath, 'application.css'), 5000)
  watchBeforeStarting()
  const nodemon = await runNodemon()
  watchAfterStarting(nodemon)
}

function clean () {
  // doesn't clean extensions.scss, should it?
  del.sync(['public/**', '.port.tmp', path.join(tempDir, 'port.tmp')])
}

function sassExtensions () {
  let fileContents = '$govuk-extensions-url-context: "/extension-assets"; $govuk-prototype-kit-major-version: 13;\n'
  if (extensions.legacyGovukFrontendFixesNeeded()) {
    fileContents += '$govuk-global-styles: true !default;'
    fileContents += '$govuk-new-link-styles: true !default;'
    fileContents += '$govuk-assets-path: $govuk-extensions-url-context + "/govuk-frontend/govuk/assets/" !default;'
  }
  fileContents += extensions.getFileSystemPaths('sass')
    .map(filePath => `@import "${filePath.split(path.sep).join('/')}";`)
    .join('\n')
  utils.ensureTempDirExistsSync(tempSassPath)
  fse.writeFileSync(path.join(tempSassPath, '_extensions.scss'), fileContents)
}

function proxyUserSassIfItExists (filename) {
  const userFilePath = path.join(projectDir, 'app', 'assets', 'sass', filename)
  const proxyFilePath = path.join(tempSassPath, 'user', filename)
  const proxyFileLines = []
  if (fse.existsSync(userFilePath)) {
    proxyFileLines.push(`@import "${userFilePath.split(path.sep).join('/')}";`)
  }
  utils.ensureTempDirExistsSync(path.dirname(proxyFilePath))

  fse.writeFileSync(path.join(proxyFilePath), proxyFileLines.join(EOL))
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

function watchBeforeStarting () {
  watchSass(appSassPath, libSassPath, appCssPath, libSassOptions)
  watchSass(appSassPath, appSassPath, appCssPath, appSassOptions)
}

function watchAfterStarting (nodemon) {
  extensions.watchPlugins(({ missing, added }) => {
    generateAssetsSync()
    if (missing.length) {
      console.log(`Removed ${missing.join(', ')}`)
    }
    if (added.length) {
      console.log(`Added ${added.join(', ')}`)
    }
    console.log('Attempting to restart nodemon')
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
      fse.unlinkSync(path.join(tempDir, 'port.tmp'))
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
      'node_modules/*',
      'package.json',
      'package-lock.json'
    ]
  })
    .on('crash', onCrash)
    .on('quit', onQuit)
}

function autoImportComponentsSync () {
  const includeString = extensions.getByType('nunjucksMacros').map(({
    item: {
      macroName,
      importFrom
    }
  }) => `{% from "${importFrom}" import ${macroName} %}`).join(EOL)

  extensions.getByType('importNunjucksMacrosInto').map(({ packageName, item: templatePath }) => {
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
  generateAssetsSync
}
