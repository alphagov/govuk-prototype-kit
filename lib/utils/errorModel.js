const fs = require('fs')
const path = require('path')
const { verboseLog } = require('./verboseLogger')
const { flagError } = require('../sync-changes')

function getSourcecode (filePath, errorLineNumber, maxLines) {
  try {
    let start = errorLineNumber - maxLines / 2
    if (start < 1 || isNaN(start)) {
      start = 1
    }
    const end = start + maxLines - 1
    const rawCode = fs.readFileSync(path.join(filePath), 'utf8')
    const [before, error, after] = rawCode
      .split('\n')
      .reduce((sections, nextLine, index) => {
        const lineNumber = index + 1
        const lineNumberGutter = lineNumber.toString().padStart(3, ' ') + '  '
        const line = lineNumberGutter + nextLine
        if (lineNumber >= start && lineNumber <= end) {
          if (lineNumber < errorLineNumber) {
            sections[0].push(line)
          } else if (lineNumber === errorLineNumber) {
            sections[1].push(line)
          } else {
            sections[2].push(line)
          }
        }
        return sections
      }, [[], [], []])
      .map((sections) => sections.join('\n'))
    return { before, error, after }
  } catch (ignoreError) {
    return { parseError: ignoreError.message }
  }
}

function nunjucksMatcherWithLineAndColumnSpelledOut (error) {
  const matcher = /\(((?:\/|[A-Z]:\\)[^)]+)\) \[Line (\d+), Column (\d+)]\s+(.+)$/
  const matches = matcher.exec(error.message)
  if (!matches) {
    verboseLog('Not nunjucksMatcherWithLineAndColumnSpelledOut')
    return
  }
  const [, filePath, line, column, message] = matches
  return {
    message,
    filePath,
    line: line && parseInt(line, 10),
    column: column && parseInt(column, 10),
    processedBy: 'nunjucksMatcherWithLineAndColumnSpelledOut'
  }
}

function nunjucksMatch (error) {
  const matcher = /\(((?:\/||[A-Z]:\\)[^\n]+)\)\s+.+\s+(.+)$/
  const matches = matcher.exec(error.message)
  if (!matches) {
    verboseLog('Not nunjucksMatcher')
    return
  }
  const [, filePath] = matches

  function processMessage (message) {
    const findString = 'Error: '
    return message.includes(findString) ? message.substring(message.lastIndexOf(findString) + findString.length) : message
  }

  return {
    message: processMessage(error.message),
    filePath,
    processedBy: 'nunjucksMatcherA'
  }
}

function nodeMatchWithLine (error) {
  const matcher = /((?:\/|[A-Z]:\\)[^:]+):(\d*)/
  const matches = matcher.exec(error.stack)
  if (!matches) {
    verboseLog('Not nodeMatchWithLine')
    return
  }
  const [, filePath, line, column] = matches
  return {
    message: error.message,
    filePath,
    line: line && parseInt(line, 10),
    column: column && parseInt(column, 10),
    processedBy: 'nodeMatchWithLine'
  }
}

function nodeMatchWithLineColonSeperated (error) {
  const matcher = /^((?:\/|[A-Z]:\\)[^:]+):(\d+)/
  const matches = matcher.exec(error.stack)
  if (!matches) {
    verboseLog('Not nodeMatchWithLineColonSeperated')
    return
  }
  const [, filePath, line] = matches
  return {
    message: error.message,
    filePath,
    line: line && parseInt(line, 10),
    processedBy: 'nodeMatchWithLineColonSeperated'
  }
}

function nodeMatchWithLineAndColumnColonSeperatedInBrackets (error) {
  const matcher = /((?:\/|[A-Z]:\\)[^:]+):(\d+):(\d+)/
  const matches = matcher.exec(error.stack)
  if (!matches) {
    verboseLog('Not nodeMatchWithLineAndColumnColonSeperatedInBrackets')
    return
  }
  const [, filePath, line, column] = matches
  return {
    message: error.message,
    filePath,
    line: line && parseInt(line, 10),
    column: column && parseInt(column, 10),
    processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets'
  }
}

function fallback (error) {
  if (!error.message) {
    return undefined
  }
  return {
    message: error.message,
    processedBy: 'fallback'
  }
}

function parseError (error) {
  if (nunjucksMatcherWithLineAndColumnSpelledOut(error)) {
    return nunjucksMatcherWithLineAndColumnSpelledOut(error)
  }
  if (nunjucksMatch(error)) {
    return nunjucksMatch(error)
  }
  if (nodeMatchWithLineColonSeperated(error)) {
    return nodeMatchWithLineColonSeperated(error)
  }
  if (nodeMatchWithLineAndColumnColonSeperatedInBrackets(error)) {
    return nodeMatchWithLineAndColumnColonSeperatedInBrackets(error)
  }
  if (nodeMatchWithLine(error)) {
    return nodeMatchWithLine(error)
  }
  return fallback(error)
}

function getErrorDetails (cwd, error) {
  const results = parseError(error)

  if (results === undefined) {
    return {}
  }

  if (error.internalErrorCode === 'TEMPLATE_NOT_FOUND') {
    delete results.filePath
    delete results.line
  }

  const {
    filePath = '',
    line,
    message = '',
    ...errorData
  } = results

  let normalisedFilePath = filePath
  if (normalisedFilePath.startsWith(cwd)) {
    normalisedFilePath = normalisedFilePath.substring(cwd.length + 1)
  }

  return {
    ...errorData,
    filePath,
    normalisedFilePath,
    line,
    message: message.split('\n')[0]
  }
}

const getErrorModel = function (error) {
  flagError(error)
  const viewObject = {
    errorStack: error.stack,
    pluginConfig: {
      scripts: [
        {
          src: '/plugin-assets/govuk-prototype-kit/lib/assets/javascripts/kit.js'
        }
      ]
    }
  }

  verboseLog('- - - Raw Error Start - - -')
  verboseLog(JSON.stringify({ message: error.message, stack: error.stack }))
  verboseLog('- - - Raw Error End - - -')

  const results = getErrorDetails(process.cwd(), error) || {}

  const {
    normalisedFilePath,
    filePath = '',
    line,
    ...errorData
  } = results

  const sourceCode = filePath && getSourcecode(filePath, line ? parseInt(line, 10) : 0, 15)

  viewObject.error = {
    ...errorData,
    filePath: !sourceCode.parseError && normalisedFilePath,
    line,
    sourceCode: !sourceCode.parseError && sourceCode
  }

  return viewObject
}

module.exports = {
  getErrorModel,
  getErrorDetails
}
