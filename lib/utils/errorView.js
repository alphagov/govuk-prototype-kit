const fs = require('fs')
const path = require('path')

function getSourcecode (filePath, errorLineNumber, maxLines) {
  try {
    let start = errorLineNumber - maxLines / 2
    if (start < 1) {
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
  const matcher = /\((\/[^)]+)\) \[Line (\d+), Column (\d+)]\s+(.+)$/
  const matches = matcher.exec(error.message)
  if (!matches) {
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
  const matcher = /\((\/[^)]+)\)\s+(.+)$/
  const matches = matcher.exec(error.message)
  if (!matches) {
    return
  }
  const [, filePath, message] = matches
  return {
    filePath,
    message
  }
}

function secondMatcher (error) {
  const matcher = /(\/[^:]+):(\d*)/
  const matches = matcher.exec(error.stack)
  if (!matches) {
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

function defaultMatcher (error) {
  const matcher = /(\/[^:]+):(\d+):(\d+)/
  const matches = matcher.exec(error.stack)
  if (!matches) {
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
      secondMatcher(error) ||
      defaultMatcher(error) ||
      {}

  const {
    filePath = '',
    line = '1',
    ...errorData
  } = results

  viewObject.error = {
    ...errorData,
    line,
    filePath: filePath.replace(process.cwd(), ''),
    sourceCode: filePath && getSourcecode(filePath, parseInt(line, 10), 15)
  }

  return viewObject
}
