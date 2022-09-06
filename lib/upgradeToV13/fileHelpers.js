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

const verboseLogError = (e) => {
  verboseLog('----')
  if (e.code) {
    verboseLog(e.code)
  }
  verboseLog(e.message)
  verboseLog(e.stack)
  verboseLog('----')
  verboseLog()
}

const joinLines = arr => arr.join(os.EOL)
const splitIntoLines = fileContents => fileContents.split(os.EOL)
const successOutput = () => true

const getFileAsLines = async (filePath) => {
  const fileContents = await fs.readFile(filePath, 'utf8')
  return splitIntoLines(fileContents)
}

const writeFileLinesToFile = async (filePath, updatedFileLines) => {
  try {
    fs.writeFile(filePath, joinLines(updatedFileLines))
    return true
  } catch (e) {
    verboseLogError(e)
  }
}

const handleNotFound = e => {
  if (e.code === 'ENOENT') {
    return true
  }
  throw e
}

const replaceStartOfFile = async ({ filePath, lineToFind, replacement }) => {
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
}

const removeLineFromFile = async ({ filePath, lineToRemove }) => {
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
}

const deleteFile = async (filePath) =>
  fs.rm(filePath)
    .then(successOutput)
    .catch(handleNotFound)

const deleteDirectory = async (dirPath) =>
  fs.rm(dirPath, { recursive: true })
    .then(successOutput)
    .catch(handleNotFound)

const deleteDirectoryIfEmpty = async (dirPath) => {
  const dirContents = await fs.readdir(dirPath)
  if (dirContents.length === 0) {
    return await deleteDirectory(dirPath)
  }
  return false
}

const copyFileFromStarter = async (partialPath) => {
  const src = path.join(packageDir, 'prototype-starter', partialPath)
  const dest = path.join(projectDir, partialPath)
  verboseLog(`copying from [${src}] to [${dest}]`)
  return fs.copyFile(src, dest)
    .then(successOutput)
    .catch(e => {
      console.warn('error caught')
      console.warn(e)
    })
}

const matchAgainstOldVersions = async (filePath) => {
  const oldVersionsDir = path.join(__dirname, 'known-old-versions', filePath.split('/').join('-'))
  const [userFile, listOfKnownReleaseVersions] = await Promise.all([
    fs.readFile(path.join(projectDir, filePath), 'utf8').catch(handleNotFound),
    fs.readdir(oldVersionsDir)
      .then(files => Promise.all(
        files.map(fileName => fs.readFile(path.join(oldVersionsDir, fileName), 'utf8'))
      ))
  ])
  return listOfKnownReleaseVersions.filter(knownVersion => knownVersion === userFile).length > 0
}

module.exports = {
  replaceStartOfFile,
  removeLineFromFile,
  deleteFile,
  deleteDirectory,
  deleteDirectoryIfEmpty,
  copyFileFromStarter,
  matchAgainstOldVersions,
  joinLines,
  verboseLog
}
