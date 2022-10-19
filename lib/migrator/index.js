const fs = require('fs').promises
const path = require('path')

const c = require('ansi-colors')
const lodash = require('lodash')

const {
  replaceStartOfFile,
  removeLineFromFile,
  verboseLog,
  deleteDirectory,
  deleteFile,
  matchAgainstOldVersions,
  deleteDirectoryIfEmpty, handleNotFound
} = require('./fileHelpers')

const { getConfig } = require('../config')
const { appDir, projectDir, packageDir, tempDir } = require('../path-utils')
const { ensureTempDirExists } = require('../util')
const logger = require('./logger')
const fse = require('fs-extra')

const reportSuccess = async (tag) => {
  const message = `Succeeded [${tag}]`
  console.log(c.green(message))
  await logger.log(message)
}

const reportFailure = async (tag, link) => {
  const message = `Failed [${tag}]${link ? ` - documentation for the manual process is here: ${link}` : ''}`
  console.warn(c.yellow(message))
  await logger.log(message)
}

const addReporter = async (tag, link) => {
  await logger.log(`Started [${tag}]`)
  return async (result) => {
    if (result === true) {
      await reportSuccess(tag)
    } else if (result === false) {
      await reportFailure(tag, link)
    }
  }
}

const filesToDelete = [
  '.port.tmp',
  'listen-on-port.js',
  'server.js',
  'start.js',
  'VERSION.txt',
  'Procfile'
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
      await reportSuccess(reportTag)
      return
    }
  }
  await reportFailure(reportTag)
}

const prepareSass = async () => {
  const reporter = await addReporter('Update application SCSS file')
  const filePath = path.join(projectDir, 'app', 'assets', 'sass', 'application.scss')
  const contents = await fs.readFile(path.join(packageDir, 'prototype-starter', 'app', 'assets', 'sass', 'application.scss'))
  const result = await replaceStartOfFile({
    filePath,
    lineToFind: '// Add extra styles here, or re-organise the Sass files in whichever way makes most sense to you',
    replacement: contents
  })
  await reporter(result)
}

const deleteUnusedFiles = async () => {
  const reporter = await addReporter('Deleted files that are no longer needed')
  const results = await Promise.all(filesToDelete.map(file =>
    deleteFile(path.join(projectDir, file))))

  const allSucceeded = results.filter(x => x !== true).length === 0
  await reporter(allSucceeded)
}

const deleteUnusedDirectories = async () => {
  const reporter = await addReporter('Deleted directories that are no longer needed')
  const results = await Promise.all(directoriesToDelete.map(file =>
    deleteDirectory(path.join(projectDir, file), { recursive: true })))

  const allSucceeded = results.filter(x => x !== true).length === 0
  await reporter(allSucceeded)
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
    const reporter = await addReporter(`Overwrite ${config.filePath}`)

    if (!matchFound) {
      await reporter(false)
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
      await verboseLog(e.message)
      await verboseLog(e.stack)
      await reporter(false)
      return
    }
    await reporter(true)
  } else if (config.action === 'delete') {
    const reporter = await addReporter(`Delete ${config.filePath}`)
    if (matchFound) {
      const result = await deleteFile(userFilePath).catch(handleNotFound(false))
      await reporter(result)
    } else if (matchFound === false) {
      await reporter(false)
    }
  }
}))

const migrateConfig = async () => {
  const oldConfigPath = path.join(appDir, 'config.js')
  const newConfigPath = path.join(appDir, 'config.json')
  const reporter = await addReporter('Migrate config.js to config.json')

  try {
    const oldConfig = getConfig(require(oldConfigPath))
    const defaultConfig = getConfig()

    const newConfig = Object.entries(defaultConfig).reduce((config, [prop, value]) => {
      if (!Object.keys(oldConfig).includes(prop) || lodash.isEqual(oldConfig[prop], value)) {
        return config
      } else {
        return { ...config, [prop]: oldConfig[prop] }
      }
    }, {})

    await fse.writeJsonSync(newConfigPath, newConfig, { encoding: 'utf8' })
    await fs.unlink(oldConfigPath)

    return reporter(true)
  } catch (e) {
    return reporter(false)
  }
}

async function moveUsageDataConfig () {
  try {
    await ensureTempDirExists()
    await fs.rename(path.join(projectDir, 'usage-data-config.js'), path.join(tempDir, 'usage-data-config.js'))
  } catch (e) {
    await verboseLog(e.message)
    await verboseLog(e.stack)
  }
}

const migrate = async () => {
  await logger.setup()

  try {
    await Promise.all([
      migrateConfig(),
      prepareAppRoutes(),
      prepareSass(),
      deleteUnusedFiles(),
      deleteUnusedDirectories(),
      upgradeIfUnchanged([
        ...filesToUpdateIfUnchanged.map(filePath => ({ filePath, action: 'copyFromKitStarter' })),
        ...filesToDeleteIfUnchanged.map(filePath => ({ filePath, action: 'delete' }))
      ]),
      moveUsageDataConfig()
    ])

    await Promise.all([
      '/app/assets/sass/patterns',
      '/app/assets/images',
      '/app/views/includes'
    ].map(async (dirPath) => {
      const reporter = await addReporter(`Remove empty directory ${dirPath}`)
      const result = await deleteDirectoryIfEmpty(path.join(projectDir, dirPath))
      await reporter(result)
    }))
  } catch (e) {
    await logger.log(e.message)
    await logger.log(e.stack)
    console.error(e.message)
    console.error(e.stack)
  }

  await logger.teardown()
}

module.exports = {
  migrate
}
