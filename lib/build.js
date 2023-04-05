
// node dependencies
const path = require('path')

// npm dependencies
const del = require('del')
const fse = require('fs-extra')
const fs = require('fs')
const sass = require('sass')

// local dependencies
const plugins = require('./plugins/plugins')
const {
  packageDir,
  projectDir,
  appSassDir,
  libSassDir,
  tmpDir,
  tmpSassDir,
  publicCssDir,
  shadowNunjucksDir,
  backupNunjucksDir,
  appViewsDir
} = require('./utils/paths')
const { recursiveDirectoryContentsSync } = require('./utils')
const { startPerformanceTimer, endPerformanceTimer } = require('./utils/performance')
const { verboseLog } = require('./utils/verboseLogger')
const { govukFrontendPaths } = require('./govukFrontendPaths')
const { hasRestartedAfterError } = require('./sync-changes')

let nodemonInstance

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

function setNodemonInstance (instance) {
  nodemonInstance = instance
}

function generateAssetsSync () {
  verboseLog('************************ GENERATE ASSETS ***************************')
  const timer = startPerformanceTimer()
  plugins.setPluginsByType()
  clean()
  sassKitFrontendDependency()
  sassLegacyPatterns()
  sassPlugins()
  sassErrorPage()
  autoImportComponentsSync()
  createBackupNunjucksSync()
  proxyUserSassIfItExists('application.scss')
  proxyUserSassIfItExists('settings.scss')

  generateCssSync()
  endPerformanceTimer('generateAssetsSync', timer)
}

function cleanNunjucks () {
  cleanShadowNunjucks()
  cleanBackupNunjucks()
}
function cleanShadowNunjucks () {
  del.sync(shadowNunjucksDir)
}
function cleanBackupNunjucks () {
  del.sync(backupNunjucksDir)
}

function clean () {
  cleanNunjucks()
  del.sync(['public/**', '.tmp/sass/**', '.port.tmp', '.tmp/port.tmp'])
}

function ensureTempDirExists (dir = tmpDir) {
  fse.ensureDirSync(dir, { recursive: true })
  fse.writeFileSync(path.join(tmpDir, '.gitignore'), '*')
}

function sassInclude (filePath) {
  return `@import "${filePath.split(path.sep).join('/')}";`
}

function sassKitFrontendDependency () {
  const timer = startPerformanceTimer()

  // Find GOV.UK Frontend (via internal package, project fallback)
  const govukFrontendInternal = govukFrontendPaths([packageDir, projectDir])

  // Get GOV.UK Frontend (internal) stylesheets
  const govukFrontendSass = (govukFrontendInternal.config?.sass || [])
    .map(sassPath => path.join(govukFrontendInternal.baseDir, sassPath))

  const fileContents = sassVariables('/manage-prototype/dependencies') +
    govukFrontendSass
      .map(sassInclude)
      .join('\n')

  ensureTempDirExists(tmpSassDir)
  fse.writeFileSync(path.join(tmpSassDir, '_kit-frontend-dependency.scss'), fileContents)
  endPerformanceTimer('sassKitFrontendDependency', timer)
}

function sassLegacyPatterns () {
  const timer = startPerformanceTimer()
  const packageConfig = fse.readJsonSync(path.join(projectDir, 'package.json'))
  let fileContents
  if (packageConfig.dependencies['govuk-frontend']) {
    fileContents = [
      'contents-list',
      'mainstream-guide',
      'pagination',
      'related-items',
      'task-list'
    ].map(filePath => path.join(libSassDir, 'patterns', filePath))
      .map(sassInclude)
      .join('\n')
  } else {
    fileContents = `
/* Legacy patterns not included as govuk-frontend plugin not installed */
    `
  }
  fse.writeFileSync(path.join(tmpSassDir, '_legacy-patterns.scss'), fileContents)
  endPerformanceTimer('sassLegacyPatterns', timer)
}

function sassVariables (contextPath = '', isLegacyGovukFrontend = false) {
  let fileContents = ''

  // Keep $govuk-extensions-url-context for backwards compatibility
  // TODO: remove in v14
  fileContents += `$govuk-extensions-url-context: "${contextPath}";\n`
  fileContents += `$govuk-plugins-url-context: "${contextPath}";\n`
  fileContents += '$govuk-prototype-kit-major-version: 13;\n'

  // Patch missing 'init.scss' before GOV.UK Frontend v4.4.0
  // in plugin versions, but will default to false for internal
  if (isLegacyGovukFrontend) {
    fileContents += '$govuk-assets-path: $govuk-extensions-url-context + "/govuk-frontend/govuk/assets/";\n'
    fileContents += '$govuk-global-styles: true !default;\n'
    fileContents += '$govuk-new-link-styles: true !default;\n'
  }

  return fileContents
}

function sassPlugins () {
  const timer = startPerformanceTimer()

  const fileContents = sassVariables('/plugin-assets', plugins.legacyGovukFrontendFixesNeeded()) +
    plugins.getFileSystemPaths('sass')
      .map(sassInclude)
      .join('\n')

  ensureTempDirExists(tmpSassDir)
  fse.writeFileSync(path.join(tmpSassDir, '_plugins.scss'), fileContents)
  endPerformanceTimer('sassPlugins', timer)
}

function sassErrorPage () {
  const timer = startPerformanceTimer()

  const fileContents = sassVariables('/manage-prototype/dependencies') +
    sassInclude(path.join(libSassDir, 'includes', '_error-page.scss'))

  ensureTempDirExists(tmpSassDir)
  fse.writeFileSync(path.join(tmpSassDir, 'error-page.scss'), fileContents)
  endPerformanceTimer('sassErrorPage', timer)
}

function proxyUserSassIfItExists (filename) {
  const timer = startPerformanceTimer()
  const userFilePath = path.join(projectDir, 'app', 'assets', 'sass', filename)
  const proxyFilePath = path.join(tmpSassDir, 'user', filename)
  const proxyFileLines = []
  if (fse.existsSync(userFilePath)) {
    proxyFileLines.push(sassInclude(userFilePath))
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
    .filter(file => ((
      file.endsWith('.scss') &&
      !file.startsWith('_') &&
      !file.startsWith('_') && !filesToSkip.includes(file)
    )))
    .forEach(file => {
      const result = sass.compile(path.join(sassPath, file), {
        quietDeps: true,
        loadPaths: [projectDir],
        sourceMap: true,
        sourceMapIncludeSources: true,
        style: 'expanded'
      })

      const cssFilename = filesToRename[file] || file.replace('.scss', '.css')
      fse.writeFileSync(path.join(cssPath, cssFilename), result.css)
    })
}

function generateCssSync (state) {
  verboseLog('************************ GENERATE SASS ***************************')
  verboseLog(state)
  const timer = startPerformanceTimer()
  try {
    _generateCssSync(libSassDir, publicCssDir, libSassOptions)
    _generateCssSync(appSassDir, publicCssDir, appSassOptions)
    if (hasRestartedAfterError()) {
      if (nodemonInstance) {
        nodemonInstance.emit('restart')
      }
    }
  } catch (e) {
    if (state) {
      verboseLog('************************ ERROR DETECTED ***************************')
      if (nodemonInstance) {
        nodemonInstance.emit('restart')
      }
    }
    if (!nodemonInstance) {
      throw e
    }
  }
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

function createBackupNunjucksSync () {
  const filesInViews = [
    appViewsDir,
    ...plugins.getFileSystemPaths('nunjucksPaths')
  ].reverse().map(recursiveDirectoryContentsSync).flat()

  function backupFilesWithExtension (fileExtension, backupExtension) {
    const filesToBackup = filesInViews.filter(x => x.endsWith(fileExtension))
    filesToBackup.forEach(fileName => {
      const backupFilePath = path.join(backupNunjucksDir, fileName.substring(0, fileName.length - fileExtension.length) + backupExtension)
      const includeMethod = fileName.split('/').includes('layouts') ? 'extends' : 'include'
      const fileContents = `{% ${includeMethod} "${fileName}" %}`

      fse.ensureDirSync(path.dirname(backupFilePath))
      fs.writeFileSync(backupFilePath, fileContents, 'utf8')
    })
  }

  backupFilesWithExtension('.njk', '.html')
  backupFilesWithExtension('.html', '.njk')
}

module.exports = {
  generateAssetsSync,
  generateCssSync,
  proxyUserSassIfItExists,
  setNodemonInstance
}
