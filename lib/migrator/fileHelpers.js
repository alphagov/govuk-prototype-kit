const path = require('path')
const { packageDir, projectDir } = require('../path-utils')
const fs = require('fs').promises
const fse = require('fs-extra')
const { log } = require('./logger')

const verboseLog = async function () {
  await log(...arguments)
  if (process.env.GPK_UPGRADE_DEBUG !== 'true') {
    return
  }
  console.log(...arguments)
}

const verboseLogError = async (e) => {
  await verboseLog('----')
  if (e.code) {
    await verboseLog(e.code)
  }
  await verboseLog(e.message)
  await verboseLog(e.stack)
  await verboseLog('----')
  await verboseLog()
}

const joinLines = arr => arr.join('\n')
const splitIntoLines = fileContents => fileContents.split('\n')
const successOutput = () => true

const getFileAsLines = async (filePath) => {
  const fileContents = await fs.readFile(filePath, 'utf8')
  return splitIntoLines(fileContents)
}

const writeFileLinesToFile = async (filePath, updatedFileLines) => {
  try {
    await fs.writeFile(filePath, joinLines(updatedFileLines))
    return true
  } catch (e) {
    await verboseLogError(e)
  }
}

const handleNotFound = resultIfFileNotFound => e => {
  if (e.code === 'ENOENT') {
    return resultIfFileNotFound
  }
  throw e
}

const replaceStartOfFile = async ({ filePath, lineToFind, replacement }) => {
  const fileLines = await getFileAsLines(filePath)
  const replacementLineNumber = fileLines.indexOf(lineToFind)
  if (replacementLineNumber > -1) {
    await verboseLog(`Found [${lineToFind}] in [${filePath}, replacing`)
    const linesFromOldFile = fileLines.splice(replacementLineNumber + 1)
    await verboseLog('Keeping these lines from old file', linesFromOldFile)
    const updatedFileLines = [replacement, ...linesFromOldFile]
    return writeFileLinesToFile(filePath, updatedFileLines)
  }
  await verboseLog(`Could not found [${lineToFind}] in [${filePath}, aborting`)
  return false
}

const removeLineFromFile = async ({ filePath, lineToRemove }) => {
  const linesToRemove = Array.isArray(lineToRemove) ? lineToRemove : [lineToRemove]
  const fileLines = await getFileAsLines(filePath)
  await verboseLog(fileLines)
  const updatedFileLines = fileLines.filter(line => !linesToRemove.includes(line))
  if (updatedFileLines.length !== fileLines.length) {
    await verboseLog(`Found [${lineToRemove}] in [${filePath}, removing`)
    return writeFileLinesToFile(filePath, updatedFileLines)
  }
  await verboseLog(`Could not found [${lineToRemove}] in [${filePath}, aborting`)
  return false
}

const deleteFile = async (filePath) =>
  (fs.rm || fs.unlink)(filePath)
    .then(successOutput)
    .catch(handleNotFound(true))

const deleteDirectory = async (dirPath) =>
  (fs.rm || fs.rmdir)(dirPath, { recursive: true })
    .then(successOutput)
    .catch(handleNotFound(true))

const deleteDirectoryIfEmpty = async (partialPath) => {
  const dirPath = path.join(projectDir, partialPath)
  const exists = await fse.pathExists(dirPath)
  if (!exists) {
    return undefined
  }
  const dirContents = await fs.readdir(dirPath)
  if (dirContents.length === 0) {
    return await deleteDirectory(dirPath, undefined)
  }
  return false
}

const copyFileFromStarter = async (starterPath, newPath) => {
  const src = path.join(packageDir, 'prototype-starter', starterPath)
  const dest = path.join(projectDir, newPath || starterPath)
  await verboseLog(`copying from [${src}] to [${dest}]`)
  return fse.copy(src, dest)
    .then(successOutput)
    .catch(async e => {
      await log('error caught')
      console.warn('error caught')
      await log(e)
      console.warn(e)
    })
}

const ignoreWhitespace = (str) => str.replace(/\s\s+/g, ' ')

const matchAgainstOldVersions = async (filePath) => {
  const oldVersionsDir = path.join(__dirname, 'known-old-versions', filePath.split('/').join('-'))
  const userPath = path.join(projectDir, filePath)

  const [userFile, listOfKnownReleaseVersions] = await Promise.all([
    fs.readFile(userPath, 'utf8').catch(handleNotFound(false)),
    fs.readdir(oldVersionsDir)
      .then(files => Promise.all(
        files.map(fileName => fs.readFile(path.join(oldVersionsDir, fileName), 'utf8'))
      ))
  ])

  if (userFile === false) {
    return
  }

  return userFile && listOfKnownReleaseVersions.some(knownVersion => ignoreWhitespace(knownVersion) === ignoreWhitespace(userFile))
}

module.exports = {
  getFileAsLines,
  writeFileLinesToFile,
  replaceStartOfFile,
  removeLineFromFile,
  deleteFile,
  deleteDirectory,
  deleteDirectoryIfEmpty,
  copyFileFromStarter,
  matchAgainstOldVersions,
  joinLines,
  verboseLog,
  handleNotFound
}
