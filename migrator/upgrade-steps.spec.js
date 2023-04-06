/* eslint-env jest */

// core dependencies
const path = require('path')

jest.mock('fs', () => {
  const readFile = jest.fn().mockResolvedValue(true)
  const writeFile = jest.fn().mockResolvedValue(true)
  return {
    promises: {
      readFile,
      writeFile
    }
  }
})

jest.mock('./reporter', () => {
  const mockReporter = jest.fn()
  return {
    addReporter: jest.fn().mockReturnValue(mockReporter),
    mockReporter,
    reportFailure: jest.fn(),
    reportSuccess: jest.fn()
  }
})

const fsp = require('fs').promises
const reporter = require('./reporter')
const { projectDir } = require('../lib/utils/paths')
const { upgradeIfPossible } = require('./upgrade-steps')

describe('upgrade steps', () => {
  const mockReporter = reporter.mockReporter

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('application file', () => {
    const applicationJsFile = path.join('app', 'assets', 'javascripts', 'application.js')
    const globalDefinition = '/* global $ */'

    it('upgrade application file if possible replacing jquery ready', async () => {
      const matchFound = false
      const originalFileContents = `${globalDefinition}

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  window.GOVUKFrontend.initAll()
  console.log('Hello')
})
`
      const expectedFileContents = `//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(function () {
  console.log('Hello')
})
`

      fsp.readFile
        .mockReturnValueOnce(originalFileContents)

      // mock call upgradeIfPossible method (get this working first)
      const result = await upgradeIfPossible(applicationJsFile, matchFound)
      expect(result).toBeTruthy()
      const expectedFileName = path.join(projectDir, applicationJsFile)

      expect(fsp.readFile).toHaveBeenCalledTimes(1)
      expect(fsp.readFile).toHaveBeenCalledWith(expectedFileName, 'utf8')

      expect(fsp.writeFile).toHaveBeenCalledTimes(1)
      const [actualFileName, actualFileContent] = fsp.writeFile.mock.calls[0]
      expect(actualFileName).toEqual(expectedFileName)
      expect(actualFileContent).toEqual(expectedFileContents)

      expect(reporter.addReporter).toHaveBeenCalledTimes(1)
      expect(reporter.addReporter).toHaveBeenCalledWith(`Update ${applicationJsFile}`)

      expect(mockReporter).toHaveBeenCalledTimes(1)
      expect(mockReporter).toHaveBeenCalledWith(true)
    })

    it('upgrade application file if possible without replacing jquery ready', async () => {
      const matchFound = false
      const originalFileContents = `${globalDefinition}

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  window.GOVUKFrontend.initAll()
  $('.my-button').click(() => console.log('clicked'))
})
`
      const expectedFileContents = `${globalDefinition}

//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//


$(document).ready(function () {
  $('.my-button').click(() => console.log('clicked'))
})
`

      fsp.readFile.mockReturnValue(originalFileContents) // For the second call

      // mock call upgradeIfPossible method (get this working first)
      const result = await upgradeIfPossible(applicationJsFile, matchFound)
      expect(result).toBeTruthy()
      const expectedFileName = path.join(projectDir, applicationJsFile)

      expect(fsp.readFile).toHaveBeenCalledTimes(1)
      expect(fsp.readFile).toHaveBeenCalledWith(expectedFileName, 'utf8')

      expect(fsp.writeFile).toHaveBeenCalledTimes(1)
      const [actualFileName, actualFileContent] = fsp.writeFile.mock.calls[0]
      expect(actualFileName).toEqual(expectedFileName)
      expect(actualFileContent).toEqual(expectedFileContents)

      expect(reporter.addReporter).toHaveBeenCalledTimes(1)
      expect(reporter.addReporter).toHaveBeenCalledWith(`Update ${applicationJsFile}`)

      expect(mockReporter).toHaveBeenCalledTimes(1)
      expect(mockReporter).toHaveBeenCalledWith(true)
    })

    it('upgrade application file when there are no similarities', async () => {
      const matchFound = false
      const mainFileContents = `$('a').on('click', function () {
  console.log('Hello')
})
$('hr').on('click', function () {
  console.log('why ware you even clicking this?')
})
`
      const fileContents = [globalDefinition, mainFileContents].join('\n')
      const expectedFileContents = `${globalDefinition}

//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

${mainFileContents}`

      fsp.readFile.mockReturnValue(fileContents)

      // mock call upgradeIfPossible method (get this working first)
      const result = await upgradeIfPossible(applicationJsFile, matchFound)
      expect(result).toBeTruthy()

      const actualFileContent = fsp.writeFile.mock.calls[0][1]
      expect(actualFileContent).toEqual(expectedFileContents)

      expect(reporter.addReporter).toHaveBeenCalledTimes(1)
      expect(reporter.addReporter).toHaveBeenCalledWith(`Update ${applicationJsFile}`)

      expect(mockReporter).toHaveBeenCalledTimes(1)
      expect(mockReporter).toHaveBeenCalledWith(true)
    })

    it('upgrade application file if possible when there only multiple jquery document ready', async () => {
      const matchFound = false
      const fileContents = `${globalDefinition}

$(document).ready(function () {
  document.doSomething()
})

$(document).ready(function () {
  document.doSomethingElse()
})

$(document).ready(function () {
  console.log('document ready')
})`

      const expectedFileContents = `//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(function () {
  document.doSomething()
})

window.GOVUKPrototypeKit.documentReady(function () {
  document.doSomethingElse()
})

window.GOVUKPrototypeKit.documentReady(function () {
  console.log('document ready')
})`

      fsp.readFile.mockReturnValue(fileContents)

      // mock call upgradeIfPossible method (get this working first)
      const result = await upgradeIfPossible(applicationJsFile, matchFound)
      expect(result).toBeTruthy()

      const actualFileContent = fsp.writeFile.mock.calls[0][1]
      expect(actualFileContent).toEqual(expectedFileContents)

      expect(reporter.addReporter).toHaveBeenCalledTimes(1)
      expect(reporter.addReporter).toHaveBeenCalledWith(`Update ${applicationJsFile}`)

      expect(mockReporter).toHaveBeenCalledTimes(1)
      expect(mockReporter).toHaveBeenCalledWith(true)
    })

    it('upgrade application file if possible when there are multiple jquery ready and other statements ', async () => {
      const matchFound = false
      const mainFileContents = `$(document).ready(function () {
  $.doSomething()
})

$(document).ready(function () {
  $('a').data('my-custom-data', $('a').attr('href')
})

$(document).ready(function () {
  console.log('document ready')
})`

      const fileContents = [globalDefinition, mainFileContents].join('\n')
      const expectedFileContents = `${globalDefinition}

//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

${mainFileContents}`

      fsp.readFile.mockReturnValue(fileContents)

      // mock call upgradeIfPossible method (get this working first)
      const result = await upgradeIfPossible(applicationJsFile, matchFound)
      expect(result).toBeTruthy()

      const actualFileContent = fsp.writeFile.mock.calls[0][1]
      expect(actualFileContent).toEqual(expectedFileContents)

      expect(reporter.addReporter).toHaveBeenCalledTimes(1)
      expect(reporter.addReporter).toHaveBeenCalledWith(`Update ${applicationJsFile}`)

      expect(mockReporter).toHaveBeenCalledTimes(1)
      expect(mockReporter).toHaveBeenCalledWith(true)
    })
  })

  it('upgrade filters file if possible', async () => {
    const filtersJsFile = path.join('app', 'assets', 'javascripts', 'filters.js')
    const matchFound = false
    const originalFileContents = `module.exports = function (env) {
  var filters = {}

  /* ------------------------------------------------------------------
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

  function getData(){
    var dummyData = require('./data/data.js')
    return dummyData;
  }

  filters.toID = function (str) {
    return str.replaceAll(" ", "-").toLowerCase();
  }

  /* ------------------------------------------------------------------
    keep the following line to return your filters to the app
  ------------------------------------------------------------------ */
  
  return filters
}
`
    const starterFileContents = `const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
`
    const expectedFileContents = `const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

  var filters = {}

  function getData(){
    var dummyData = require('./data/data.js')
    return dummyData;
  }

  filters.toID = function (str) {
    return str.replaceAll(" ", "-").toLowerCase();
  }

// Add the filters using the addFilter function
Object.entries(filters).forEach(([name, fn]) => addFilter(name, fn))
`

    fsp.readFile
      .mockReturnValueOnce(originalFileContents) // For the first call
      .mockReturnValueOnce(starterFileContents) // For the second call

    // mock call upgradeIfPossible method (get this working first)
    const result = await upgradeIfPossible(filtersJsFile, matchFound)
    expect(result).toBeTruthy()
    const expectedFileName = path.join(projectDir, filtersJsFile)

    expect(fsp.readFile).toHaveBeenCalledTimes(2)
    expect(fsp.readFile).toHaveBeenCalledWith(expectedFileName, 'utf8')

    expect(fsp.writeFile).toHaveBeenCalledTimes(1)
    const [actualFileName, actualFileContent] = fsp.writeFile.mock.calls[0]
    expect(actualFileName).toEqual(expectedFileName)
    expect(actualFileContent).toEqual(expectedFileContents)

    expect(reporter.addReporter).toHaveBeenCalledTimes(1)
    expect(reporter.addReporter).toHaveBeenCalledWith(`Update ${filtersJsFile}`)

    expect(mockReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter).toHaveBeenCalledWith(true)
  })
})
