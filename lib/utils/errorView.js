const fs = require('fs')
const path = require('path')
const { verboseLog } = require('./verboseLogger')

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
    return {}
  }
}

function nunjucksMatcherWithLineAndColumn (error) {
  const matcher = /\((\/[^]+|[A-Z]:\\[^]+)\) \[Line (\d+), Column (\d+)]\s+(.+)$/
  const matches = matcher.exec(error.message)
  if (!matches) {
    verboseLog('Not nunjucksMatcherWithLineAndColumn')
    return
  }
  const [, filePath, line, column, message] = matches
  return {
    filePath,
    line,
    column,
    message
  }
}

function nunjucksMatcher (error) {
  const matcher = /\((\/[^]+|[A-Z]:\\[^]+)\)\s+(.+)$/
  const matches = matcher.exec(error.message)
  if (!matches) {
    verboseLog('Not nunjucksMatcher')
    return
  }
  const [, filePath, message] = matches
  return {
    filePath,
    message
  }
}

function nodeMatchWithLine (error) {
  const matcher = /(\/[^:]+|[A-Z]:\\[^:]+):(\d*)/
  const matches = matcher.exec(error.stack)
  if (!matches) {
    verboseLog('Not nodeMatchWithLine')
    return
  }
  const [, filePath, line, column] = matches
  return {
    filePath,
    line,
    column,
    message: error.message
  }
}

function nodeMatchWithLineAndColumn (error) {
  const matcher = /(\/[^:]+|[A-Z]:\\[^:]+):(\d+):(\d+)/
  const matches = matcher.exec(error.stack)
  if (!matches) {
    verboseLog('Not nodeMatchWithLineAndColumn')
    return
  }
  const [, filePath, line, column] = matches
  return {
    filePath,
    line,
    column,
    message: error.message
  }
}

module.exports = function (error) {
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

  const results = nunjucksMatcherWithLineAndColumn(error) ||
    nunjucksMatcher(error) ||
    nodeMatchWithLine(error) ||
    nodeMatchWithLineAndColumn(error) ||
    {}

  if (error.internalErrorCode === 'TEMPLATE_NOT_FOUND') {
    delete results.filePath
    delete results.line
  }

  const {
    filePath = '',
    line = '1',
    ...errorData
  } = results

  const normalisedFilePath = filePath.replace(process.cwd(), '').replaceAll('\\', '/')

  viewObject.error = {
    ...errorData,
    line,
    filePath: normalisedFilePath.replace('/',''),
    sourceCode: filePath && getSourcecode(filePath, parseInt(line, 10), 15)
  }

  return viewObject
}
