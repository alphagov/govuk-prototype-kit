
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
  createBackupNunjucksSync()
  proxyUserSassIfItExists('application.scss')
  proxyUserSassIfItExists('settings.scss')

  generateCssSync()
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
  // doesn't clean extensions.scss, should it?
  // TODO: These files are deprecated, remove this line in v14?
  del.sync(['public/**', '.port.tmp', '.tmp/port.tmp'])
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
  _generateCssSync(appSassDir, publicCssDir, appSassOptions)
  _generateCssSync(libSassDir, publicCssDir, libSassOptions)
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

function rebuildNunjucksSync () {
  cleanBackupNunjucks()
  createBackupNunjucksSync()
}

module.exports = {
  generateAssetsSync,
  generateCssSync,
  proxyUserSassIfItExists,
  rebuildNunjucksSync
}
