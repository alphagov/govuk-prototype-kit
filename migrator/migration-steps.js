
// core dependencies
const path = require('path')
const fsp = require('fs').promises

// npm dependencies
const fse = require('fs-extra')
const lodash = require('lodash')

// local dependencies
const { searchAndReplaceFiles } = require('../lib/utils')
const { appDir, projectDir, packageDir, starterDir } = require('../lib/utils/paths')
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

async function upgradeIfUnchanged (filePaths, starterFilePath, additionalStep) {
  return Promise.all(filePaths.map(async filePath => {
    const matchFound = await matchAgainstOldVersions(filePath)

    const reporter = await addReporter(`Overwrite ${filePath}`)

    let result = false
    try {
      if (matchFound) {
        await copyFileFromStarter(starterFilePath || filePath, filePath)
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
}

async function updateUnbrandedLayouts (dir) {
  const results = await searchAndReplaceFiles(
    path.join(projectDir, dir),
    '"layout_unbranded.html"',
    '"govuk-prototype-kit/layouts/unbranded.html"',
    ['.html', '.njk'])
  return results.flat()
}

async function upgradeIfPossible (filePath, matchFound) {
  if (matchFound) {
    return true
  } else {
    const reporter = await addReporter(`Update ${filePath}`)
    const fullPath = path.join(projectDir, filePath)
    const filename = fullPath.split(path.sep).pop()
    switch (filename) {
      case 'application.js':
        return await upgradeApplicationJs(fullPath, reporter)
      case 'filters.js':
        return await upgradeFiltersJs(fullPath, reporter)
      default:
        await reporter(false)
        return false
    }
  }
}

function removeMatchedText (originalContent, matchText) {
  const originalContentLines = originalContent.split('\n')
  const newContentLines = []

  // Remove the matchText from the original code
  while (originalContentLines.length) {
    const match = matchText.findIndex((text) => text.every((line, index) => {
      const originalContentLine = originalContentLines[index]
      return line === originalContentLine.trim()
    }))
    if (match === -1) {
      newContentLines.push(originalContentLines.shift())
    } else {
      matchText[match].forEach(() => originalContentLines.shift())
    }
  }
  return newContentLines.join('\n')
}

function occurencesOf (searchText, text) {
  return text.split(searchText).length - 1
}

async function upgradeApplicationJs (fullPath, reporter) {
  const commentText = `//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//`
  const matchText = [
    [
      '// Warn about using the kit in production',
      'if (window.console && window.console.info) {',
      'window.console.info(\'GOV.UK Prototype Kit - do not use for production\')',
      '}'
    ],
    ['window.GOVUKFrontend.initAll()']
  ]
  const jqueryReadyText = '$(document).ready('
  const kitReadyText = 'window.GOVUKPrototypeKit.documentReady('
  const originalContent = await fsp.readFile(fullPath, 'utf8')

  // Remove the matchText from the original code
  let modifiedContent = removeMatchedText(originalContent, matchText)
  if (occurencesOf(jqueryReadyText, modifiedContent) === occurencesOf('$.', modifiedContent) + occurencesOf('$(', modifiedContent)) {
    modifiedContent = modifiedContent.replaceAll(jqueryReadyText, kitReadyText)
    // Remove if jQuery is not necessary
    if (!modifiedContent.includes('$(') && !modifiedContent.includes('$.')) {
      modifiedContent = modifiedContent.replaceAll(/\/\*\s*global\s+\$\s?\*\/[\s\r\n]*/g, '')
    }
  }

  const newContentLines = []
  let commentInserted = false

  const modifiedContentLines = modifiedContent.split('\n')

  modifiedContentLines.forEach((line, index) => {
    if (!commentInserted) {
      if (![
        /\/\*\s*global\s+/,
        /"use strict"/
      ].some((regex) => line.search(regex) > -1)) {
        if (index > 0) {
          newContentLines.push('')
        }
        commentText.split('\n').forEach((commentLine) => newContentLines.push(commentLine))
        // insert a blank line after the comments if it's not the first line
        commentInserted = true
        if (line.trim().length > 0) {
          newContentLines.push('')
        }
      }
    }
    newContentLines.push(line)
  })

  await fsp.writeFile(fullPath, newContentLines.join('\n'))
  await reporter(true)
  return true
}

async function upgradeFiltersJs (fullPath, reporter) {
  const firstLine = 'module.exports = function (env) {'
  const lastLine = 'return filters'
  const originalContent = await fsp.readFile(fullPath, 'utf8')

  // Only convert the filters if the first and last lines above are found in the file
  if (![firstLine, lastLine].every(line => originalContent.includes(line))) {
    await reporter(false)
    return false
  }

  const matchText = [
    [firstLine],
    [
      '/* ------------------------------------------------------------------',
      'keep the following line to return your filters to the app',
      '------------------------------------------------------------------ */'
    ],
    [lastLine]
  ]
  const starterFile = path.join(starterDir, 'app', 'filters.js')
  const starterContent = await fsp.readFile(starterFile, 'utf8')

  // Remove the matchText from the original code
  const modifiedContent = removeMatchedText(originalContent, matchText)

  // Remove the final bracket and add the addFilter conversion code
  const newContent = starterContent + '\n' +
    modifiedContent.substring(0, modifiedContent.lastIndexOf('}')).trimEnd() + '\n' + `
// Add the filters using the addFilter function
Object.entries(filters).forEach(([name, fn]) => addFilter(name, fn))
`
  await fsp.writeFile(fullPath, newContent)
  await reporter(true)
  return true
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
  upgradeIfUnchanged,
  updateUnbrandedLayouts,
  upgradeIfPossible
}
