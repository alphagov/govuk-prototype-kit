const os = require('os')
const path = require('path')
const { packageDir, projectDir } = require('../path-utils')
const fs = require('fs').promises

const verboseLog = function () {
  if (process.env.GPK_UPGRADE_DEBUG !== 'true') {
    return
  }
  console.log(...arguments)
}

const joinLines = arr => arr.join(os.EOL)
const splitIntoLines = fileContents => fileContents.split(os.EOL)
const successOutput = () => true

const getFileAsLines = (filePath) => fs.readFile(filePath, 'utf8').then(splitIntoLines)

const writeFileLinesToFile = (filePath, updatedFileLines) => fs.writeFile(filePath, joinLines(updatedFileLines))
  .then(successOutput)

const handleNotFound = e => {
  if (e.code === 'ENOENT') {
    return true
  }
  throw e
}
module.exports = {
  replaceStartOfFile: async ({ filePath, lineToFind, replacement }) => {
    const fileLines = await getFileAsLines(filePath)
    const replacementLineNumber = fileLines.indexOf(lineToFind)
    if (replacementLineNumber > -1) {
      verboseLog(`Found [${lineToFind}] in [${filePath}, replacing`)
      const linesFromOldFile = fileLines.splice(replacementLineNumber + 1)
      verboseLog('Keeping these lines from old file', linesFromOldFile)
      const updatedFileLines = [replacement, ...linesFromOldFile]
      return writeFileLinesToFile(filePath, updatedFileLines)
    }
    verboseLog(`Could not found [${lineToFind}] in [${filePath}, aborting`)
    return false
  },
  removeLineFromFile: async ({ filePath, lineToRemove }) => {
    const linesToRemove = Array.isArray(lineToRemove) ? lineToRemove : [lineToRemove]
    const fileLines = await getFileAsLines(filePath)
    verboseLog(fileLines)
    const updatedFileLines = fileLines.filter(line => !linesToRemove.includes(line))
    if (updatedFileLines.length !== fileLines.length) {
      verboseLog(`Found [${lineToRemove}] in [${filePath}, removing`)
      return writeFileLinesToFile(filePath, updatedFileLines)
    }
    verboseLog(`Could not found [${lineToRemove}] in [${filePath}, aborting`)
    return false
  },
  deleteFile: async (filePath) =>
    fs.rm(filePath)
      .then(successOutput)
      .catch(handleNotFound),
  deleteDirectory: async (filePath) =>
    fs.rm(filePath, { recursive: true })
      .then(successOutput)
      .catch(handleNotFound),
  copyFileFromStarter: async (partialPath) => {
    const src = path.join(packageDir, 'prototype-starter', partialPath)
    const dest = path.join(projectDir, partialPath)
    verboseLog(`copying from [${src}] to [${dest}]`)
    return fs.copyFile(src, dest)
      .then(successOutput)
      .catch(e => {
        console.warn('error caught')
        console.warn(e)
      })
  },
  matchAgainstOldVersions: async (filePath) => {
    const oldVersionsDir = path.join(__dirname, 'known-old-versions', filePath.split('/').join('-'))
    return Promise.all([
      fs.readFile(path.join(projectDir, filePath), 'utf8'),
      fs.readdir(oldVersionsDir)
        .then(files => Promise.all(
          files.map(fileName => fs.readFile(path.join(oldVersionsDir, fileName), 'utf8'))
        ))
    ])
      .then(([userFile, listOfKnownReleaseVersions]) =>
        listOfKnownReleaseVersions.filter(knownVersion => knownVersion === userFile).length > 0
      )
  },
  joinLines,
  verboseLog
}
