/* eslint-env jest */

// core dependencies
const path = require('path')

jest.mock('fs-extra', () => {
  return {
    pathExists: jest.fn().mockResolvedValue(true),
    writeJsonSync: jest.fn().mockResolvedValue(true),
    readFile: jest.fn().mockResolvedValue('')
  }
})

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

jest.mock('../lib/utils', () => {
  return {
    searchAndReplaceFiles: jest.fn().mockResolvedValue([])
  }
})

jest.mock('./file-helpers', () => {
  return {
    getFileAsLines: jest.fn().mockResolvedValue(true),
    writeFileLinesToFile: jest.fn().mockResolvedValue(true),
    deleteFile: jest.fn().mockResolvedValue(true),
    replaceStartOfFile: jest.fn().mockResolvedValue(true),
    removeLineFromFile: jest.fn().mockResolvedValue(true),
    deleteDirectory: jest.fn().mockResolvedValue(true),
    matchAgainstOldVersions: jest.fn().mockResolvedValue(true),
    copyFileFromStarter: jest.fn().mockResolvedValue(true),
    verboseLog: jest.fn().mockResolvedValue(true),
    handleNotFound: jest.fn()
  }
})

const fse = require('fs-extra')
const fsp = require('fs').promises
const reporter = require('./reporter')
const fileHelpers = require('./file-helpers')
const config = require('../lib/config')
const { projectDir, starterDir, appDir } = require('../lib/utils/paths')

const migrationSteps = require('./migration-steps')
const { preflightChecks, deleteIfUnchanged, removeOldPatternIncludesFromSassFile } = require('./migration-steps')
const { migrateConfig, prepareAppRoutes, prepareSass, deleteUnusedFiles, deleteUnusedDirectories, upgradeIfUnchanged, upgradeIfPossible } = migrationSteps

describe('migration steps', () => {
  const mockReporter = reporter.mockReporter

  beforeEach(() => {
    fileHelpers.replaceStartOfFile.mockResolvedValue(true)
    fileHelpers.getFileAsLines.mockResolvedValue(true)
    fileHelpers.matchAgainstOldVersions.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('preflight checks', () => {
    const filesToCheck = ['foo', 'bar', 'foo/bar']

    beforeEach(() => {
      fileHelpers.getFileAsLines.mockResolvedValue(['8.1.1'])
    })

    const testPreflightChecks = async (state) => {
      fse.pathExists.mockImplementation(async (path) => state && !path.includes('v6'))
      const checksPassed = await preflightChecks(filesToCheck, path.join(projectDir, 'v6'), 8)

      expect(fse.pathExists).toHaveBeenCalledTimes(4)
      expect(fse.pathExists).toHaveBeenNthCalledWith(1, path.join(projectDir, 'v6'))
      expect(fse.pathExists).toHaveBeenNthCalledWith(2, path.join(projectDir, filesToCheck[0]))
      expect(fse.pathExists).toHaveBeenNthCalledWith(3, path.join(projectDir, filesToCheck[1]))
      expect(fse.pathExists).toHaveBeenNthCalledWith(4, path.join(projectDir, filesToCheck[2]))

      expect(mockReporter).toHaveBeenCalledTimes(1)
      expect(mockReporter).toHaveBeenCalledWith(state)

      return checksPassed
    }

    it('success', async () => {
      const success = await testPreflightChecks(true)
      expect(success).toBeTruthy()
    })

    it('fail', async () => {
      const success = await testPreflightChecks(false)
      expect(success).toBeFalsy()
    })
  })

  it('migrate config', async () => {
    const defaultConfig = { foo: true, baz: false }
    const oldConfig = { baz: true, bar: false }
    const newConfig = { baz: true }

    config.getConfig = jest.fn().mockReturnValue(defaultConfig)
    migrationSteps.getOldConfig = jest.fn().mockReturnValue(oldConfig)

    const configFile = 'config'
    const result = await migrateConfig(configFile)

    expect(result).toBeTruthy()

    expect(fse.writeJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.writeJsonSync).toHaveBeenNthCalledWith(1, path.join(appDir, `${configFile}.json`), newConfig, { encoding: 'utf8' })

    expect(fileHelpers.deleteFile).toHaveBeenCalledTimes(1)
    expect(fileHelpers.deleteFile).toHaveBeenNthCalledWith(1, configFile)

    expect(mockReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter).toHaveBeenCalledWith(true)
  })

  describe('prepare app routes', () => {
    const content = 'foo'
    const routes = 'routes'

    beforeEach(async () => {
      fse.readFile.mockReturnValue(content)
    })

    it('success', async () => {
      const result = await prepareAppRoutes(routes)

      expect(result).toBeTruthy()

      expect(fse.readFile).toHaveBeenCalledTimes(1)
      expect(fse.readFile).toHaveBeenNthCalledWith(1, path.join(starterDir, routes), 'utf8')

      expect(fileHelpers.replaceStartOfFile).toHaveBeenCalledTimes(1)
      expect(fileHelpers.replaceStartOfFile).toHaveBeenCalledWith({
        filePath: path.join(projectDir, routes),
        lineToFind: '// Add your routes here - above the module.exports line',
        replacement: content
      })

      expect(fileHelpers.removeLineFromFile).toHaveBeenCalledTimes(1)
      expect(fileHelpers.removeLineFromFile).toHaveBeenCalledWith({
        filePath: path.join(projectDir, routes),
        lineToRemove: [
          'module.exports = router;',
          'module.exports = router'
        ]
      })

      expect(reporter.reportSuccess).toHaveBeenCalledTimes(1)
      expect(reporter.reportSuccess).toHaveBeenCalledWith('Update routes file')

      expect(reporter.reportFailure).toHaveBeenCalledTimes(0)
    })

    it('failure', async () => {
      fileHelpers.replaceStartOfFile.mockResolvedValue(false)

      const result = await prepareAppRoutes(routes)

      expect(result).toBeFalsy()

      expect(fileHelpers.removeLineFromFile).toHaveBeenCalledTimes(0)
      expect(reporter.reportSuccess).toHaveBeenCalledTimes(0)

      expect(reporter.reportFailure).toHaveBeenCalledTimes(1)
      expect(reporter.reportFailure).toHaveBeenCalledWith('Update routes file')
    })
  })

  it('prepare sass', async () => {
    const content = 'baz'

    fse.readFile.mockReturnValue(content)

    const sass = 'sass'
    const result = await prepareSass(sass)

    expect(result).toBeTruthy()

    expect(fse.readFile).toHaveBeenCalledTimes(1)
    expect(fse.readFile).toHaveBeenCalledWith(path.join(starterDir, sass), 'utf8')

    expect(fileHelpers.replaceStartOfFile).toHaveBeenCalledTimes(1)
    expect(fileHelpers.replaceStartOfFile).toHaveBeenCalledWith({
      filePath: path.join(projectDir, sass),
      lineToFind: '// Add extra styles here, or re-organise the Sass files in whichever way makes most sense to you',
      replacement: content
    })

    expect(mockReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter).toHaveBeenCalledWith(true)
  })

  it('remove old pattern includes from sass', async () => {
    const sassFile = 'foo-bar.scss'

    const deletedPatterns = [
      'app/assets/sass/patterns/_foo.scss',
      'app/assets/sass/patterns/_baz.scss'
    ]

    const patternsToDelete = [
      'app/assets/sass/patterns/_foo.scss',
      'app/assets/sass/patterns/_bar.scss',
      'app/assets/sass/patterns/_baz.scss'
    ]

    const originalSassContent = `
      @import "patterns/foo";
      @import "patterns/bar";
      @import "patterns/baz";
    `

    const updatedSassContent = `
      @import "patterns/bar";
    `

    fileHelpers.getFileAsLines.mockReturnValue(originalSassContent.split('\n'))
    fse.pathExists.mockImplementation(async (path) => !deletedPatterns.includes(path))

    const result = await removeOldPatternIncludesFromSassFile(patternsToDelete, sassFile)

    expect(result).toBeTruthy()

    expect(fileHelpers.getFileAsLines).toHaveBeenCalledTimes(1)
    expect(fileHelpers.getFileAsLines).toHaveBeenCalledWith(path.join(projectDir, sassFile))

    expect(fileHelpers.writeFileLinesToFile).toHaveBeenCalledTimes(1)
    expect(fileHelpers.writeFileLinesToFile).toHaveBeenCalledWith(path.join(projectDir, sassFile), updatedSassContent.split('\n'))

    expect(mockReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter).toHaveBeenCalledWith(true)
  })

  it('delete unused files', async () => {
    const filesToDelete = ['foo', 'bar']
    await deleteUnusedFiles(filesToDelete)

    expect(fileHelpers.deleteFile).toHaveBeenCalledTimes(2)
    expect(fileHelpers.deleteFile).toHaveBeenNthCalledWith(1, path.join(projectDir, filesToDelete[0]))
    expect(fileHelpers.deleteFile).toHaveBeenNthCalledWith(2, path.join(projectDir, filesToDelete[1]))

    expect(mockReporter).toHaveBeenCalledTimes(3)
    expect(mockReporter).toHaveBeenNthCalledWith(1, true)
    expect(mockReporter).toHaveBeenNthCalledWith(2, true)
    expect(mockReporter).toHaveBeenNthCalledWith(3, true)
  })

  it('delete unused directories', async () => {
    const directoriesToDelete = ['foo', 'bar']
    const result = await deleteUnusedDirectories(directoriesToDelete)

    expect(result).toBeTruthy()

    expect(fileHelpers.deleteDirectory).toHaveBeenCalledTimes(2)
    expect(fileHelpers.deleteDirectory).toHaveBeenNthCalledWith(1, path.join(projectDir, directoriesToDelete[0]), { recursive: true })
    expect(fileHelpers.deleteDirectory).toHaveBeenNthCalledWith(2, path.join(projectDir, directoriesToDelete[1]), { recursive: true })

    expect(mockReporter).toHaveBeenCalledTimes(3)
    expect(mockReporter).toHaveBeenNthCalledWith(1, true)
    expect(mockReporter).toHaveBeenNthCalledWith(2, true)
    expect(mockReporter).toHaveBeenNthCalledWith(3, true)
  })

  it('upgrade if unchanged layout', async () => {
    const layout = 'app/views/layout.html'
    const additionalStep = jest.fn().mockResolvedValue(true)

    const result = await upgradeIfUnchanged([layout], layout, additionalStep)

    expect(result).toBeTruthy()

    expect(fileHelpers.matchAgainstOldVersions).toHaveBeenCalledTimes(1)
    expect(fileHelpers.matchAgainstOldVersions).toHaveBeenCalledWith(layout)

    expect(additionalStep).toHaveBeenCalledTimes(1)
    expect(additionalStep).toHaveBeenCalled()

    expect(reporter.addReporter).toHaveBeenCalledTimes(1)
    expect(reporter.addReporter).toHaveBeenCalledWith(`Overwrite ${layout}`)

    expect(mockReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter).toHaveBeenCalledWith(true)
  })

  it('report if changed layout', async () => {
    const layout = 'app/views/layout.html'
    const additionalStep = jest.fn().mockResolvedValue(true)

    fileHelpers.matchAgainstOldVersions.mockReturnValue(false)

    const result = await upgradeIfUnchanged([layout], layout, additionalStep)

    expect(result).toBeTruthy()

    expect(fileHelpers.matchAgainstOldVersions).toHaveBeenCalledTimes(1)
    expect(fileHelpers.matchAgainstOldVersions).toHaveBeenCalledWith(layout)

    expect(additionalStep).toHaveBeenCalledTimes(1)
    expect(additionalStep).toHaveBeenCalled()

    expect(reporter.addReporter).toHaveBeenCalledTimes(1)
    expect(reporter.addReporter).toHaveBeenCalledWith(`Overwrite ${layout}`)

    expect(mockReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter).toHaveBeenCalledWith(true)
  })

  it('delete if unchanged unbranded layout', async () => {
    const unbrandedLayout = 'app/views/layout_unbranded.html'

    const result = await deleteIfUnchanged([unbrandedLayout])

    expect(result).toBeTruthy()

    expect(fileHelpers.matchAgainstOldVersions).toHaveBeenCalledTimes(1)
    expect(fileHelpers.matchAgainstOldVersions).toHaveBeenCalledWith(unbrandedLayout)

    expect(fileHelpers.copyFileFromStarter).toHaveBeenCalledTimes(0)

    expect(reporter.addReporter).toHaveBeenCalledTimes(1)
    expect(reporter.addReporter).toHaveBeenCalledWith(`Delete ${unbrandedLayout}`)

    expect(fileHelpers.deleteFile).toHaveBeenCalledTimes(1)
    expect(fileHelpers.deleteFile).toHaveBeenNthCalledWith(1, path.join(projectDir, unbrandedLayout))

    expect(mockReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter).toHaveBeenCalledWith(true)
  })

  it('upgrade application file if possible', async () => {
    const applicationJsFile = path.join('app', 'assets', 'javascripts', 'application.js')
    const matchFound = false
    const fileContents = `/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  window.GOVUKFrontend.initAll()
  console.log('Hello')
})
`
    const expectedFileContents =
`//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//



window.GOVUKPrototypeKit.documentReady(() => {
  // Add JavaScript here
  console.log('Hello')
})
`

    fsp.readFile.mockReturnValue(Buffer.from(fileContents, 'utf-8'))

    // mock call upgradeIfPossible method (get this working first)
    const result = await upgradeIfPossible(applicationJsFile, matchFound)
    expect(result).toBeTruthy()
    const expectedFileName = path.join(projectDir, applicationJsFile)

    expect(fsp.readFile).toHaveBeenCalledTimes(1)
    expect(fsp.readFile).toHaveBeenCalledWith(expectedFileName)

    expect(fsp.writeFile).toHaveBeenCalledTimes(1)
    const [actualFileName, actualFileContent] = fsp.writeFile.mock.calls[0]
    expect(actualFileName).toEqual(expectedFileName)
    expect(actualFileContent).toEqual(expectedFileContents)

    expect(reporter.addReporter).toHaveBeenCalledTimes(1)
    expect(reporter.addReporter).toHaveBeenCalledWith(`Update ${applicationJsFile}`)

    expect(mockReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter).toHaveBeenCalledWith(true)
  })
})
