const path = require('path')
const lodash = require('lodash')
const fse = require('fs-extra')
const { promises: fs } = require('fs')
const { appDir, projectDir, packageDir } = require('../path-utils')
const { getConfig } = require('../config')
const { addReporter, reportSuccess, reportFailure } = require('./reporter')
const {
  deleteFile, replaceStartOfFile, removeLineFromFile, deleteDirectory,
  matchAgainstOldVersions,
  verboseLog,
  handleNotFound
} = require('./fileHelpers')

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
    await deleteFile(oldConfigPath).catch(handleNotFound(false))

    return reporter(true)
  } catch (e) {
    return reporter(false)
  }
}
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

const deleteUnusedFiles = async (filesToDelete) => {
  const reporter = await addReporter('Deleted files that are no longer needed')
  const results = await Promise.all(filesToDelete.map(file =>
    deleteFile(path.join(projectDir, file))))

  const allSucceeded = results.filter(x => x !== true).length === 0
  await reporter(allSucceeded)
}

const deleteUnusedDirectories = async (directoriesToDelete) => {
  const reporter = await addReporter('Deleted directories that are no longer needed')
  const results = await Promise.all(directoriesToDelete.map(file =>
    deleteDirectory(path.join(projectDir, file), { recursive: true })))

  const allSucceeded = results.filter(x => x !== true).length === 0
  await reporter(allSucceeded)
}

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

module.exports = {
  migrateConfig,
  prepareAppRoutes,
  prepareSass,
  deleteUnusedFiles,
  deleteUnusedDirectories,
  upgradeIfUnchanged
}
