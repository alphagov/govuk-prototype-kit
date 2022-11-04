const path = require('path')
const lodash = require('lodash')
const fse = require('fs-extra')
const { appDir, projectDir, packageDir } = require('../path-utils')
const config = require('../config')
const { addReporter, reportSuccess, reportFailure } = require('./reporter')
const {
  getFileAsLines,
  deleteFile,
  replaceStartOfFile,
  removeLineFromFile,
  deleteDirectory,
  matchAgainstOldVersions,
  copyFileFromStarter,
  verboseLog,
  handleNotFound
} = require('./fileHelpers')

// Allows mocking of getOldConfig
module.exports.getOldConfig = (oldConfigPath) => config.getConfig(require(path.join(projectDir, oldConfigPath)))

const preFlightChecksFilesExist = async (filesToCheck) => {
  const results = await Promise.all(filesToCheck.map(async (filename) => fse.pathExists(path.join(projectDir, filename))))
  return !results.includes(false)
}

const preFlightChecksValidVersion = async (minimumVersion) => {
  try {
    const versionData = await getFileAsLines(path.join(projectDir, 'VERSION.txt'))
    const [version] = versionData[0].trim().split('.')
    return parseInt(version) >= minimumVersion
  } catch (e) {
    return false
  }
}

module.exports.preflightChecks = async (filesToCheck, v6Folder, minimumVersion) => {
  const reporter = await addReporter('Check migration is being applied to a pre v13 prototype')
  const checksPass = (
    !await fse.pathExists(v6Folder) &&
    await preFlightChecksFilesExist(filesToCheck) &&
    await preFlightChecksValidVersion(minimumVersion)
  )
  await reporter(checksPass)
  return checksPass
}

module.exports.migrateConfig = async (oldConfigPath) => {
  const newConfigPath = path.join(appDir, 'config.json')
  const reporter = await addReporter('Migrate config.js to config.json')

  try {
    const oldConfig = module.exports.getOldConfig(oldConfigPath)
    const defaultConfig = config.getConfig()

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

module.exports.prepareAppRoutes = async (routesFile) => {
  const reportTag = 'Update routes file'
  const filePath = path.join(projectDir, routesFile)
  const exportLine = 'module.exports = router'
  const fileContents = await fse.readFile(path.join(packageDir, 'prototype-starter', routesFile), 'utf8')
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

module.exports.prepareSass = async (sassFile) => {
  const reporter = await addReporter('Update application SCSS file')
  const filePath = path.join(projectDir, sassFile)
  const contents = await fse.readFile(path.join(packageDir, 'prototype-starter', sassFile), 'utf8')
  const result = await replaceStartOfFile({
    filePath,
    lineToFind: '// Add extra styles here, or re-organise the Sass files in whichever way makes most sense to you',
    replacement: contents
  })
  await reporter(result)
}

module.exports.deleteUnusedFiles = async (filesToDelete) => {
  const reporter = await addReporter('Deleted files that are no longer needed')
  const results = await Promise.all(filesToDelete.map(file =>
    deleteFile(path.join(projectDir, file))))

  const allSucceeded = results.filter(x => x !== true).length === 0
  await reporter(allSucceeded)
}

module.exports.deleteUnusedDirectories = async (directoriesToDelete) => {
  const reporter = await addReporter('Deleted directories that are no longer needed')
  const results = await Promise.all(directoriesToDelete.map(file =>
    deleteDirectory(path.join(projectDir, file), { recursive: true })))

  const allSucceeded = results.filter(x => x !== true).length === 0
  await reporter(allSucceeded)
}

module.exports.upgradeIfUnchanged = (configs) => Promise.all(configs.map(async config => {
  const matchFound = await matchAgainstOldVersions(config.filePath)

  if (config.action === 'copyFromKitStarter') {
    const reporter = await addReporter(`Overwrite ${config.filePath}`)

    if (!matchFound) {
      await reporter(false)
      return
    }
    try {
      await copyFileFromStarter(config.filePath)
      if (config.filePath === 'app/views/layout.html') {
        await module.exports.upgradeIfUnchanged([
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
      const result = await deleteFile(path.join(projectDir, config.filePath)).catch(handleNotFound(false))
      await reporter(result)
    } else if (matchFound === false) {
      await reporter(false)
    }
  }
}))
