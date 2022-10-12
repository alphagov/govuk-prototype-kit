const fs = require('fs').promises

const c = require('ansi-colors')

const {
  replaceStartOfFile,
  removeLineFromFile,
  verboseLog,
  deleteDirectory,
  deleteFile,
  copyFileFromStarter,
  matchAgainstOldVersions,
  deleteDirectoryIfEmpty, handleNotFound
} = require('./fileHelpers')
const path = require('path')
const { projectDir, packageDir } = require('../path-utils')
const { exec } = require('../exec')

const fullReport = []
const reportSuccess = tag => fullReport.push(() => console.log(c.green(`Succeeded [${tag}]`)))
const reportFailure = (tag, link) => fullReport.push(() => console.warn(c.yellow(`Failed [${tag}]${link ? ` - documentation for the manual process is here: ${link}` : ''}`)))
const displayReport = () => {
  fullReport.forEach(fn => fn())
}

const addReporter = (tag, link) => result => {
  if (result === true) {
    reportSuccess(tag)
  } else if (result === false) {
    reportFailure(tag, link)
  }
}

const filesToDelete = [
  'listen-on-port.js',
  'server.js',
  'start.js',
  'VERSION.txt',
  'Procfile',
  'package.json'
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
const prepareAppRoutes = async () => {
  const reportTag = 'Update routes file'
  const filePath = path.join(projectDir, 'app', 'routes.js')
  const exportLine = 'module.exports = router'
  const fileContents = await fs.readFile(path.join(packageDir, 'prototype-starter', 'app', 'routes.js'))
  const success = await replaceStartOfFile({
    filePath,
    lineToFind: '// Add your routes here - above the module.exports line',
    replacement: fileContents
  })
  if (success) {
    const finalResult = await removeLineFromFile({
      filePath,
      lineToRemove: [`${exportLine};`, exportLine]
    })
    if (finalResult === true) {
      reportSuccess(reportTag)
      return
    }
  }
  reportFailure(reportTag)
}

const prepareSass = async () => {
  const filePath = path.join(projectDir, 'app', 'assets', 'sass', 'application.scss')
  const contents = await fs.readFile(path.join(packageDir, 'prototype-starter', 'app', 'assets', 'sass', 'application.scss'))
  const result = await replaceStartOfFile({
    filePath,
    lineToFind: '// Add extra styles here, or re-organise the Sass files in whichever way makes most sense to you',
    replacement: contents
  })
  addReporter('Update application SCSS file')(result)
}

const deleteUnusedFiles = async () => {
  const results = await Promise.all(filesToDelete.map(file =>
    deleteFile(path.join(projectDir, file))))

  const allSucceeded = results.filter(x => x !== true).length === 0
  addReporter('Deleted files that are no longer needed')(allSucceeded)
}

const deleteUnusedDirectories = async () => {
  const results = await Promise.all(directoriesToDelete.map(file =>
    deleteDirectory(path.join(projectDir, file), { recursive: true })))

  const allSucceeded = results.filter(x => x !== true).length === 0
  addReporter('Deleted directories that are no longer needed')(allSucceeded)
}

const filesToUpdateIfUnchanged = [
  'app/assets/javascripts/application.js',
  'app/filters.js',
  'app/views/layout.html'
]

const filesToDeleteIfUnchanged = [
  'app/assets/images/separator-2x.png',
  'app/assets/images/separator.png',
  'app/assets/images/unbranded.ico',
  'app/assets/javascripts/auto-store-data.js',
  'app/assets/javascripts/jquery-1.11.3.js',
  'app/assets/sass/application.scss',
  'app/assets/sass/patterns/_contents-list.scss',
  'app/assets/sass/patterns/_check-your-answers.scss',
  'app/assets/sass/patterns/_mainstream-guide.scss',
  'app/assets/sass/patterns/_pagination.scss',
  'app/assets/sass/patterns/_related-items.scss',
  'app/assets/sass/patterns/_step-by-step-header.scss',
  'app/assets/sass/patterns/_step-by-step-related.scss',
  'app/assets/sass/patterns/_step-by-step-nav.scss',
  'app/assets/sass/patterns/_step-by-step-navigation.scss',
  'app/assets/sass/patterns/_task-list.scss',
  'app/assets/sass/unbranded-ie8.scss',
  'app/assets/sass/unbranded.scss',
  'app/views/includes/breadcrumb_examples.html',
  'app/views/includes/cookie-banner.html',
  'app/views/layout_unbranded.html'
]

const upgradeIfUnchanged = (configs) => Promise.all(configs.map(async config => {
  const matchFound = await matchAgainstOldVersions(config.filePath)
  const userFilePath = path.join(projectDir, config.filePath)

  if (config.action === 'copyFromKitStarter') {
    const reporter = addReporter(`Overwrite ${config.filePath}`)

    if (!matchFound) {
      reporter(false)
      return
    }
    const releaseFilePath = path.join(packageDir, 'prototype-starter', config.filePath)
    try {
      await fs.copyFile(releaseFilePath, userFilePath)
      if (config.filePath === 'app/views/layout.html') {
        await upgradeIfUnchanged([
          {
            filePath: 'app/views/includes/head.html',
            action: 'delete'
          },
          {
            filePath: 'app/views/includes/scripts.html',
            action: 'delete'
          }
        ])
      }
    } catch (e) {
      verboseLog(e.message)
      verboseLog(e.stack)
      reporter(false)
      return
    }
    reporter(true)
  } else if (config.action === 'delete') {
    const reporter = addReporter(`Delete ${config.filePath}`)
    if (matchFound) {
      const result = await deleteFile(userFilePath).catch(handleNotFound(false))
      reporter(result)
    } else if (matchFound === false) {
      reporter(false)
    }
  }
}))

const migrate = async () => {
  try {
    await Promise.all([
      prepareAppRoutes(),
      prepareSass(),
      deleteUnusedFiles(),
      deleteUnusedDirectories(),
      upgradeIfUnchanged([
        ...filesToUpdateIfUnchanged.map(filePath => ({ filePath, action: 'copyFromKitStarter' })),
        ...filesToDeleteIfUnchanged.map(filePath => ({ filePath, action: 'delete' }))
      ])
    ])
  } catch (e) {
    console.error(e.message)
    console.error(e.stack)
  }

  await Promise.all([
    '/app/assets/sass/patterns',
    '/app/assets/images',
    '/app/views/includes'
  ].map(async (dirPath) => {
    const result = await deleteDirectoryIfEmpty(path.join(projectDir, dirPath))
    addReporter(`Remove empty directory ${dirPath}`)(result)
  }))

  const packageResult = await copyFileFromStarter('package.json')
  addReporter('Copied base package.json')(packageResult)

  const execResult = await exec(`npm install ${packageDir} govuk-frontend`,
    { cwd: projectDir })
  addReporter('Install required node dependencies')(execResult)

  displayReport()
}

module.exports = {
  migrate
}
