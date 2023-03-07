
// node dependencies
const path = require('path')

// npm dependencies
const del = require('del')
const fse = require('fs-extra')
const sass = require('sass')

// local dependencies
const plugins = require('./plugins/plugins')
const {
  projectDir,

  appSassDir,

  libSassDir,

  tmpDir,
  tmpSassDir,
  publicCssDir,
  shadowNunjucksDir
} = require('./utils/paths')
const { startPerformanceTimer, endPerformanceTimer } = require('./utils/performance')

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
  const timer = startPerformanceTimer()
  plugins.setPluginsByType()
  clean()
  sassPlugins()
  autoImportComponentsSync()
  proxyUserSassIfItExists('application.scss')
  proxyUserSassIfItExists('settings.scss')

  generateCssSync()
  endPerformanceTimer('generateAssetsSync', timer)
}

function clean () {
  // doesn't clean extensions.scss, should it?
  // TODO: These files are deprecated, remove this line in v14?
  del.sync(['public/**', '.port.tmp', '.tmp/port.tmp'])
}

function ensureTempDirExists (dir = tmpDir) {
  fse.ensureDirSync(dir, { recursive: true })
  fse.writeFileSync(path.join(tmpDir, '.gitignore'), '*')
}

function sassPlugins () {
  const timer = startPerformanceTimer()
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
  endPerformanceTimer('sassPlugins', timer)
}

function proxyUserSassIfItExists (filename) {
  const timer = startPerformanceTimer()
  const userFilePath = path.join(projectDir, 'app', 'assets', 'sass', filename)
  const proxyFilePath = path.join(tmpSassDir, 'user', filename)
  const proxyFileLines = []
  if (fse.existsSync(userFilePath)) {
    proxyFileLines.push(`@import "${userFilePath.split(path.sep).join('/')}";`)
  }
  ensureTempDirExists(path.dirname(proxyFilePath))

  fse.writeFileSync(path.join(proxyFilePath), proxyFileLines.join('\n'))
  endPerformanceTimer('proxyUserSassIfItExists', timer)
}

function _generateCssSync (sassPath, cssPath, options = {}) {
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

function generateCssSync () {
  const timer = startPerformanceTimer()
  _generateCssSync(appSassDir, publicCssDir, appSassOptions)
  _generateCssSync(libSassDir, publicCssDir, libSassOptions)
  endPerformanceTimer('generateCssSync', timer)
}

function autoImportComponentsSync () {
  const timer = startPerformanceTimer()
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
  endPerformanceTimer('autoImportComponentsSync', timer)
}

module.exports = {
  generateAssetsSync,
  generateCssSync,
  proxyUserSassIfItExists
}
