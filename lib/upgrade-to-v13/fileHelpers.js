const os = require('os')
const fs = require('fs').promises

const verboseLog = function () {
  if (process.env.GPK_UPGRADE_DEBUG !== 'true') {
    return
  }
  console.log(...arguments)
}

const joinLines = arr => arr.join(os.EOL)
const splitIntoLines = fileContents => fileContents.split(os.EOL)

const getFileAsLines = (filePath) => fs.readFile(filePath, 'utf8').then(splitIntoLines)

const writeFileLinesToFile = (filePath, updatedFileLines) => fs.writeFile(filePath, joinLines(updatedFileLines))
  .then(() => true)

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
  deleteFile: async (filePath) => {
    return fs.rm(filePath)
      .then(() => true)
      .catch(handleNotFound)
  },
  deleteDirectory: async (filePath) => {
    return fs.rm(filePath, {recursive: true})
      .then(() => true)
      .catch(handleNotFound)
  },
  joinLines,
  verboseLog
}
