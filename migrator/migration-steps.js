
// core dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')
const lodash = require('lodash')

// local dependencies
const { searchAndReplaceFiles } = require('../lib/utils')
const { appDir, projectDir, packageDir } = require('../lib/utils/paths')
const config = require('../lib/config')
const logger = require('./logger')
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
  handleNotFound,
  deleteDirectoryIfEmpty,
  writeFileLinesToFile
} = require('./file-helpers')
const { upgradeIfPossible } = require('./upgrade-steps')

// Allows mocking of getOldConfig
const getOldConfig = (oldConfigPath) => config.getConfig(require(path.join(projectDir, oldConfigPath)))

async function preFlightChecksFilesExist (filesToCheck) {
  const results = await Promise.all(filesToCheck.map(async (filename) => fse.pathExists(path.join(projectDir, filename))))
  return !results.includes(false)
}

async function preFlightChecksValidVersion (minimumVersion) {
  try {
    const versionData = await getFileAsLines(path.join(projectDir, 'VERSION.txt'))
    const [version] = versionData[0].trim().split('.')
    return parseInt(version) >= minimumVersion
  } catch (e) {
    return false
  }
}

async function preflightChecks (filesToCheck, v6Folder, minimumVersion) {
  const reporter = await addReporter('Check migration is being applied to a pre v13 prototype')
  console.log(minimumVersion)
  const checksPass = (
    !await fse.pathExists(v6Folder) &&
    await preFlightChecksFilesExist(filesToCheck) &&
    await preFlightChecksValidVersion(minimumVersion)
  )
  await reporter(checksPass)
  return checksPass
}

async function migrateConfig (oldConfigPath) {
  const newConfigPath = path.join(appDir, 'config.json')
  const reporter = await addReporter('Migrate config.js to config.json')
  let result = false

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
    await deleteFile(oldConfigPath)
    result = true
  } catch (e) {
    await logger.log(e.message)
    await logger.log(e.stack)
  }

  await reporter(result)
  return result
}

async function prepareAppRoutes (routesFile) {
  const reportTag = 'Update routes file'
  const filePath = path.join(projectDir, routesFile)
  const exportLine = 'module.exports = router'
  const fileContents = await fse.readFile(path.join(packageDir, 'prototype-starter', routesFile), 'utf8')
  const success = await replaceStartOfFile({
    filePath,
    lineToFind: '// Add your routes here - above the module.exports line',
    replacement: fileContents
  })
  const finalResult = (success && await removeLineFromFile({
    filePath,
    lineToRemove: [`${exportLine};`, exportLine]
  }))
  finalResult ? await reportSuccess(reportTag) : await reportFailure(reportTag)
  return finalResult
}

async function prepareSass (sassFile) {
  const reporter = await addReporter('Update application SCSS file')
  const filePath = path.join(projectDir, sassFile)
  const contents = await fse.readFile(path.join(packageDir, 'prototype-starter', sassFile), 'utf8')
  const result = await replaceStartOfFile({
    filePath,
    lineToFind: '// Add extra styles here, or re-organise the Sass files in whichever way makes most sense to you',
    replacement: contents
  })
  await reporter(result)
  return result
}

async function removeOldPatternIncludesFromSassFile (patterns, sassFile) {
  const reporter = await addReporter('Remove old pattern includes from application SCSS file')
  const deletedPatterns = (await Promise.all(patterns.map(async file => await fse.pathExists(file) ? undefined : file)))
    .filter((file) => file)
    .map((file) => `@import "patterns/${file.substring(file.indexOf('/_') + 2, file.indexOf('.scss'))}";`)
  const filePath = path.join(projectDir, sassFile)
  const originalContent = await getFileAsLines(filePath)
  const updatedContent = originalContent.filter((line) => {
    return !deletedPatterns.includes(line.trim())
  })
  const succeeded = await writeFileLinesToFile(filePath, updatedContent)
  await reporter(succeeded)
  return succeeded
}

async function deleteUnusedFiles (filesToDelete) {
  const reporter = await addReporter('Deleted files that are no longer needed')
  const results = await Promise.all(filesToDelete.map(async file => {
    const filePath = path.join(projectDir, file)
    if (!await fse.pathExists(filePath)) {
      // Do not report files that don't exist
      return true
    }
    const reporter = await addReporter(`Delete ${file}`)
    const result = await deleteFile(path.join(projectDir, file))
    await reporter(result)
    return result
  }))

  const allSucceeded = results.filter(x => x !== true).length === 0
  await reporter(allSucceeded)
  return allSucceeded
}

async function deleteUnusedDirectories (directoriesToDelete) {
  const reporter = await addReporter('Deleted directories that are no longer needed')
  const results = await Promise.all(directoriesToDelete.map(async dir => {
    const dirPath = path.join(projectDir, dir)
    if (!await fse.pathExists(dirPath)) {
      // Do not report directories that don't exist
      return true
    }
    const reporter = await addReporter(`Remove unused directory ${dir}`)
    const result = await deleteDirectory(dirPath, { recursive: true })
    await reporter(result)
    return result
  }))

  const allSucceeded = results.filter(x => x !== true).length === 0
  await reporter(allSucceeded)
  return allSucceeded
}

async function deleteEmptyDirectories (directoriesToDelete) {
  return Promise.all(directoriesToDelete.map(async (dirPath) => {
    if (!await fse.pathExists(path.join(projectDir, dirPath))) {
      // Do not report directories that don't exist
      return true
    }
    const reporter = await addReporter(`Remove empty directory ${dirPath}`)
    // Only report if a directory is empty
    if (await deleteDirectoryIfEmpty(dirPath)) {
      await reporter(true)
    } else {
      await logger.log(`Skipped deleting ${dirPath}`)
    }
    return true
  }))
}

async function deleteIfUnchanged (filePaths) {
  return Promise.all(filePaths.map(async filePath => {
    if (!await fse.pathExists(path.join(projectDir, filePath))) {
      // Do not report files that don't exist
      return true
    }

    const matchFound = await matchAgainstOldVersions(filePath)
    const reporter = await addReporter(`Delete ${filePath}`)
    let result = false

    if (matchFound) {
      result = await deleteFile(path.join(projectDir, filePath)).catch(handleNotFound(false))
    }

    await reporter(result)
    return result
  }))
}

// Special case app/views/layout.html, as it has moved in prototype
// starter files, but we don't want to move for existing users
async function upgradeLayoutIfUnchanged (filePath, starterFilePath) {
  const matchFound = await matchAgainstOldVersions(filePath)
  const reporter = await addReporter(`Overwrite ${filePath}`)

  let result = false
  try {
    if (matchFound) {
      await copyFileFromStarter(starterFilePath, filePath)
      result = true
    }
  } catch (e) {
    await verboseLog(e.message)
    await verboseLog(e.stack)
  }

  await reporter(result)
  return result
}

async function upgradeIfUnchanged (filePaths, additionalStep) {
  const results = await Promise.all(filePaths.map(async filePath => {
    const matchFound = await matchAgainstOldVersions(filePath)

    const reporter = await addReporter(`Overwrite ${filePath}`)

    let result = false
    try {
      if (matchFound) {
        await copyFileFromStarter(filePath)
      }
      if (additionalStep) {
        result = await additionalStep(filePath, matchFound)
      } else {
        result = matchFound
      }
    } catch (e) {
      await verboseLog(e.message)
      await verboseLog(e.stack)
    }

    await reporter(result)
    return result
  }))
  return results
}

async function updateUnbrandedLayouts (dir) {
  const results = await searchAndReplaceFiles(
    path.join(projectDir, dir),
    '"layout_unbranded.html"',
    '"govuk-prototype-kit/layouts/unbranded.html"',
    ['.html', '.njk'])
  return results.flat()
}

module.exports = {
  getOldConfig,
  preflightChecks,
  migrateConfig,
  prepareAppRoutes,
  prepareSass,
  removeOldPatternIncludesFromSassFile,
  deleteUnusedFiles,
  deleteUnusedDirectories,
  deleteEmptyDirectories,
  deleteIfUnchanged,
  upgradeLayoutIfUnchanged,
  upgradeIfUnchanged,
  updateUnbrandedLayouts,
  upgradeIfPossible
}
