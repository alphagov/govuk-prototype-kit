/* eslint-env jest */

const path = require('path')
const fse = require('fs-extra')

jest.mock('./reporter', () => {
  const mockReporter = jest.fn()
  return {
    addReporter: jest.fn().mockReturnValue(mockReporter),
    mockReporter: mockReporter,
    reportFailure: jest.fn(),
    reportSuccess: jest.fn()
  }
})

jest.mock('./fileHelpers', () => {
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

const reporter = require('./reporter')
const fileHelpers = require('./fileHelpers')
const config = require('./../config')
const { projectDir, starterDir, appDir } = require('../path-utils')

const migrationSteps = require('./migrationSteps')
const { preflightChecks, deleteIfUnchanged, removeOldPatternIncludesFromSassFile } = require('./migrationSteps')
const { migrateConfig, prepareAppRoutes, prepareSass, deleteUnusedFiles, deleteUnusedDirectories, upgradeIfUnchanged } = migrationSteps

describe('migration steps', () => {
  const mockReporter = reporter.mockReporter

  beforeEach(() => {
    fileHelpers.replaceStartOfFile.mockResolvedValue(true)
    fileHelpers.getFileAsLines.mockResolvedValue(true)
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
      fse.pathExists = jest.fn().mockImplementation(async (path) => state && !path.includes('v6'))
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
    fse.writeJsonSync = jest.fn().mockResolvedValue(true)

    const configFile = 'config'
    await migrateConfig(configFile)

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
      fse.readFile = jest.fn().mockReturnValue(content)
    })

    it('success', async () => {
      await prepareAppRoutes(routes)

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

      await prepareAppRoutes(routes)

      expect(fileHelpers.removeLineFromFile).toHaveBeenCalledTimes(0)
      expect(reporter.reportSuccess).toHaveBeenCalledTimes(0)

      expect(reporter.reportFailure).toHaveBeenCalledTimes(1)
      expect(reporter.reportFailure).toHaveBeenCalledWith('Update routes file')
    })
  })

  it('prepare sass', async () => {
    const content = 'baz'

    fse.readFile = jest.fn().mockReturnValue(content)

    const sass = 'sass'
    await prepareSass(sass)

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
    fse.pathExistsSync = jest.fn().mockImplementation(async (path) => !deletedPatterns.includes(path))

    await removeOldPatternIncludesFromSassFile(patternsToDelete, sassFile)

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

    expect(mockReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter).toHaveBeenCalledWith(true)
  })

  it('delete unused directories', async () => {
    const directoriesToDelete = ['foo', 'bar']
    await deleteUnusedDirectories(directoriesToDelete)

    expect(fileHelpers.deleteDirectory).toHaveBeenCalledTimes(2)
    expect(fileHelpers.deleteDirectory).toHaveBeenNthCalledWith(1, path.join(projectDir, directoriesToDelete[0]), { recursive: true })
    expect(fileHelpers.deleteDirectory).toHaveBeenNthCalledWith(2, path.join(projectDir, directoriesToDelete[1]), { recursive: true })

    expect(mockReporter).toHaveBeenCalledTimes(1)
    expect(mockReporter).toHaveBeenCalledWith(true)
  })

  it('upgrade if unchanged layout', async () => {
    const layout = 'app/views/layout.html'
    const additionalStep = jest.fn().mockResolvedValue(true)

    await upgradeIfUnchanged([layout], layout, additionalStep)

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

    await deleteIfUnchanged([unbrandedLayout])

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
})
