
// node dependencies
const path = require('path')

// npm dependencies
const chokidar = require('chokidar')
const colour = require('ansi-colors')
const del = require('del')
const fse = require('fs-extra')
const nodemon = require('nodemon')
const sass = require('sass')

// local dependencies
const plugins = require('./plugins/plugins')
const utils = require('./utils')
const {
  projectDir,
  packageDir,

  appDir,
  appSassDir,

  libSassDir,

  tmpDir,
  tmpSassDir,
  publicCssDir,
  portTmpFile,
  shadowNunjucksDir
} = require('./utils/paths')

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
  plugins.setPluginsByType()
  clean()
  sassPlugins()
  autoImportComponentsSync()
  proxyUserSassIfItExists('application.scss')
  proxyUserSassIfItExists('settings.scss')

  generateCss(appSassDir, publicCssDir, appSassOptions)
  generateCss(libSassDir, publicCssDir, libSassOptions)
}

async function buildWatchAndServe () {
  generateAssetsSync()
  await utils.waitUntilFileExists(path.join(publicCssDir, 'application.css'), 5000)
  watchBeforeStarting()
  const nodemon = await runNodemon()
  watchAfterStarting(nodemon)
}

function clean () {
  // doesn't clean extensions.scss, should it?
  del.sync(['public/**', '.port.tmp', portTmpFile])
}

function ensureTempDirExists (dir = tmpDir) {
  fse.ensureDirSync(dir, { recursive: true })
  fse.writeFileSync(path.join(tmpDir, '.gitignore'), '*')
}

function sassPlugins () {
  let fileContents = ''
  // Keep $govuk-extensions-url-context for backwards compatibility
  // TODO: remove in v14
  fileContents += '$govuk-extensions-url-context: "/plugin-assets";\n'
  fileContents += '$govuk-plugins-url-context: "/plugin-assets";\n'
  fileContents += '$govuk-prototype-kit-major-version: 13;\n'
  if (plugins.legacyGovukFrontendFixesNeeded()) {
    fileContents += '$govuk-global-styles: true !default;\n'
    fileContents += '$govuk-new-link-styles: true !default;\n'
    fileContents += '$govuk-assets-path: $govuk-plugin-url-context + "/govuk-frontend/govuk/assets/" !default;\n'
  }
  fileContents += plugins.getFileSystemPaths('sass')
    .map(filePath => `@import "${filePath.split(path.sep).join('/')}";`)
    .join('\n')
  ensureTempDirExists(tmpSassDir)
  fse.writeFileSync(path.join(tmpSassDir, '_plugins.scss'), fileContents)
}

function proxyUserSassIfItExists (filename) {
  const userFilePath = path.join(projectDir, 'app', 'assets', 'sass', filename)
  const proxyFilePath = path.join(tmpSassDir, 'user', filename)
  const proxyFileLines = []
  if (fse.existsSync(userFilePath)) {
    proxyFileLines.push(`@import "${userFilePath.split(path.sep).join('/')}";`)
  }
  ensureTempDirExists(path.dirname(proxyFilePath))

  fse.writeFileSync(path.join(proxyFilePath), proxyFileLines.join('\n'))
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
    ignoreInitial: true,
    disableGlobbing: true // Prevents square brackets from being mistaken for globbing characters
  }).on('all', () => {
    generateCss(generateSassPath, cssPath, options)
  })
}

function watchBeforeStarting () {
  watchSass(appSassDir, libSassDir, publicCssDir, libSassOptions)
  watchSass(appSassDir, appSassDir, publicCssDir, appSassOptions)
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

function autoImportComponentsSync () {
  const includeString = plugins.getByType('nunjucksMacros').map(({
    item: {
      macroName,
      importFrom
    }
  }) => `{% from "${importFrom}" import ${macroName} %}`).join('\n')

  plugins.getByType('importNunjucksMacrosInto').map(({ packageName, item: templatePath }) => {
    return {
      shadowPath: path.join(shadowNunjucksDir, packageName, templatePath),
      newContents: [
        includeString,
        fse.readFileSync(path.join(projectDir, 'node_modules', packageName, templatePath), 'utf8')
      ].join('\n\n')
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
