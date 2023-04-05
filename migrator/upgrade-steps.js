// core dependencies
const path = require('path')
const fsp = require('fs').promises

// local dependencies
const { starterDir, projectDir } = require('../lib/utils/paths')
const { addReporter } = require('./reporter')

function removeMatchedText (originalContent, matchText) {
  const originalContentLines = originalContent.split('\n')
  const newContentLines = []

  // Remove the matchText from the original code
  while (originalContentLines.length) {
    const match = matchText.findIndex((text) => text.every((line, index) => {
      const originalContentLine = originalContentLines[index]
      return line === originalContentLine?.trim()
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

const oldFilterFirstCommentLines = `/**
   * Instantiate object used to store the methods registered as a
   * 'filter' (of the same name) within nunjucks. You can override
   * gov.uk core filters by creating filter methods of the same name.
   * @type {Object}
   */`.split('\n').map(line => line.trim())

const oldFilterSecondCommentLines = `/* ------------------------------------------------------------------
    add your methods to the filters obj below this comment block:
    @example:

    filters.sayHi = function(name) {
        return 'Hi ' + name + '!'
    }

    Which in your templates would be used as:

    {{ 'Paul' | sayHi }} => 'Hi Paul'

    Notice the first argument of your filters method is whatever
    gets 'piped' via '|' to the filter.

    Filters can take additional arguments, for example:

    filters.sayHi = function(name,tone) {
      return (tone == 'formal' ? 'Greetings' : 'Hi') + ' ' + name + '!'
    }

    Which would be used like this:

    {{ 'Joel' | sayHi('formal') }} => 'Greetings Joel!'
    {{ 'Gemma' | sayHi }} => 'Hi Gemma!'

    For more on filters and how to write them see the Nunjucks
    documentation.

  ------------------------------------------------------------------ */
`.split('\n').map(line => line.trim())

const oldFilterThirdCommentLines = `
  /* ------------------------------------------------------------------
    keep the following line to return your filters to the app
  ------------------------------------------------------------------ */
  `.split('\n').map(line => line.trim())

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
    oldFilterFirstCommentLines,
    oldFilterSecondCommentLines,
    oldFilterThirdCommentLines,
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

module.exports = {
  upgradeIfPossible
}
