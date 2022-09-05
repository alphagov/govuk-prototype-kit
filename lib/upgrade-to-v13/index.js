const fs = require('fs').promises

const c = require('ansi-colors')

const {
  replaceStartOfFile,
  removeLineFromFile,
  verboseLog,
  deleteDirectory,
  deleteFile,
  copyFileFromStarter
} = require('./fileHelpers')
const path = require('path')
const { projectDir, packageDir } = require('../path-utils')
const { exec } = require('./exec')

const fullReport = []
const reportSuccess = tag => fullReport.push(() => console.log(c.green(`[${tag}] Successful`)))
const reportFailure = (tag, link) => fullReport.push(() => console.warn(c.yellow(`[${tag}] Could not be upgraded${link ? ` - documentation for the manual process is here: ${link}` : ''}`)))
const displayReport = () => {
  verboseLog('full report', fullReport)
  fullReport.forEach(fn => fn())
}

const addReport = (tag, link) => result => {
  verboseLog('add report called')
  if (result) {
    reportSuccess(tag)
  } else {
    reportFailure(tag, link)
  }
}

const ifPreviousSucceeded = fn => result => {
  if (result) {
    return fn()
  } else {
    return result
  }
}

const filesToDelete = [
  'listen-on-port.js',
  'server.js',
  'start.js',
  'VERSION.txt',
  'Procfile',
  'VERSION.txt',
  'package.json',
  'app/assets/images/separator-2x.png',
  'app/assets/images/separator.png',
  'app/assets/images/unbranded.ico',
  'app/assets/javascripts/auto-store-data.js',
  'app/assets/javascripts/jquery-1.11.3.js',
  'app/assets/sass/application-ie8.scss',
  'app/assets/sass/patterns/_contents-list.scss',
  'app/assets/sass/patterns/_mainstream-guide.scss',
  'app/assets/sass/patterns/_pagination.scss',
  'app/assets/sass/patterns/_related-items.scss',
  'app/assets/sass/patterns/_task-list.scss'
]
const directoriesToDelete = [
  'docs',
  'lib',
  '__tests__',
  'cypress',
  'internal_docs',
  'scripts',
  'update',
  'node_modules',
  'public'
]
const prepareAppRoutes = () => {
  const filePath = path.join(projectDir, 'app', 'routes.js')
  const exportLine = 'module.exports = router'
  return fs.readFile(path.join(packageDir, 'prototype-starter', 'app', 'routes.js'))
    .then(contents => replaceStartOfFile({
      filePath,
      lineToFind: '// Add your routes here - above the module.exports line',
      replacement: contents
    }))
    .then(ifPreviousSucceeded(() => removeLineFromFile({
      filePath,
      lineToRemove: [`${exportLine};`, exportLine]
    })))
    .then(addReport('Update routes file', 'https://google.com/'))
}

const prepareSass = () => {
  const filePath = path.join(projectDir, 'app', 'assets', 'sass', 'application.scss')
  return fs.readFile(path.join(packageDir, 'prototype-starter', 'app', 'assets', 'sass', 'application.scss'))
    .then(contents => replaceStartOfFile({
      filePath,
      lineToFind: '// Add extra styles here, or re-organise the Sass files in whichever way makes most sense to you',
      replacement: contents
    }))
    .then(addReport('Update application CSS file', 'https://google.com/'))
}

const prepareFilters = () => {
  const userFileLocation = path.join(projectDir, 'app', 'filters.js')
  return Promise.all([
    fs.readFile(path.join(__dirname, 'oldFiltersFile.txt'), 'utf8'),
    fs.readFile(userFileLocation, 'utf8')
  ])
    .then(outputs => {
      const [originalFileContents, userFileContents] = outputs
      if (originalFileContents === userFileContents) {
        return deleteFile(userFileLocation)
          .then(() => copyFileFromStarter('app/filters.js'))
          .then(() => true)
      }
      return false
    })
    .then(addReport('Update filters.js', 'https://yahoo.com/'))
}

const deleteUnusedFiles = () => Promise.all(filesToDelete.map(file =>
  deleteFile(path.join(projectDir, file))))
  .then(addReport('Deleted files that are no longer needed', 'https://bing.com/'))

const deleteUnusedDirectories = () => Promise.all(directoriesToDelete.map(file =>
  deleteDirectory(path.join(projectDir, file), { recursive: true })))
  .then(addReport('Deleted directories that are no longer needed', 'https://bing.com/'))

const runUpgrade = () => Promise.all([
  prepareAppRoutes(),
  prepareSass(),
  prepareFilters(),
  deleteUnusedFiles(),
  deleteUnusedDirectories()
])
  .then(() => copyFileFromStarter('package.json')
    .then(addReport('Copied base package.json')))
  .then(() => exec(`npm install ${packageDir} govuk-frontend`,
    { cwd: projectDir })
    .then(addReport('Install required node dependencies'))
  )
  .then(displayReport)

module.exports = {
  runUpgrade
}
