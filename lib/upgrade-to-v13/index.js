const fs = require('fs').promises

const c = require('ansi-colors')

const { replaceStartOfFile, removeLineFromFile, verboseLog, deleteDirectory } = require('./fileHelpers')
const path = require('path')
const { projectDir, packageDir } = require('../path-utils')

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
  'VERSION.txt'
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

const deleteUnusedFiles = () => Promise.all(filesToDelete.map(file => {
  deleteFile(path.join(packageDir, file))
    .then(addReport('Deleted files that are no longer needed', 'https://bing.com/'))
}))

const deleteUnusedDirectories = () => Promise.all(directoriesToDelete.map(file => {
  deleteDirectory(path.join(packageDir, file), { recursive: true })
    .then(addReport('Deleted files that are no longer needed', 'https://bing.com/'))
}))

const runUpgrade = () => Promise.all([
  prepareAppRoutes(),
  deleteUnusedFiles(),
  deleteUnusedDirectories()
])
  .then(displayReport)

module.exports = {
  runUpgrade
}
