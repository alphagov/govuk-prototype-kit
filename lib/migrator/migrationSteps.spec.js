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
const { migrateConfig, prepareAppRoutes, prepareSass, deleteUnusedFiles, deleteUnusedDirectories, upgradeIfUnchanged } = migrationSteps

describe('migration steps', () => {
  const mockReporter = reporter.mockReporter

  beforeEach(() => {
    fileHelpers.replaceStartOfFile.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
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
    expect(fse.readFile).toHaveBeenNthCalledWith(1, path.join(starterDir, sass), 'utf8')

    expect(fileHelpers.replaceStartOfFile).toHaveBeenCalledTimes(1)
    expect(fileHelpers.replaceStartOfFile).toHaveBeenCalledWith({
      filePath: path.join(projectDir, sass),
      lineToFind: '// Add extra styles here, or re-organise the Sass files in whichever way makes most sense to you',
      replacement: content
    })

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
    const head = 'app/views/includes/head.html'
    const scripts = 'app/views/includes/scripts.html'

    await upgradeIfUnchanged([
      { filePath: layout, action: 'copyFromKitStarter' }
    ])

    expect(fileHelpers.matchAgainstOldVersions).toHaveBeenCalledTimes(3)
    expect(fileHelpers.matchAgainstOldVersions).toHaveBeenNthCalledWith(1, layout)
    expect(fileHelpers.matchAgainstOldVersions).toHaveBeenNthCalledWith(2, head)
    expect(fileHelpers.matchAgainstOldVersions).toHaveBeenNthCalledWith(3, scripts)

    expect(reporter.addReporter).toHaveBeenCalledTimes(3)
    expect(reporter.addReporter).toHaveBeenNthCalledWith(1, `Overwrite ${layout}`)
    expect(reporter.addReporter).toHaveBeenNthCalledWith(2, `Delete ${head}`)
    expect(reporter.addReporter).toHaveBeenNthCalledWith(3, `Delete ${scripts}`)

    expect(fileHelpers.deleteFile).toHaveBeenCalledTimes(2)
    expect(fileHelpers.deleteFile).toHaveBeenNthCalledWith(1, path.join(projectDir, head))
    expect(fileHelpers.deleteFile).toHaveBeenNthCalledWith(2, path.join(projectDir, scripts))

    expect(mockReporter).toHaveBeenCalledTimes(3)
    expect(mockReporter).toHaveBeenNthCalledWith(1, true)
    expect(mockReporter).toHaveBeenNthCalledWith(2, true)
    expect(mockReporter).toHaveBeenNthCalledWith(3, true)
  })

  it('upgrade if unchanged unbranded layout', async () => {
    const unbrandedLayout = 'app/views/layout_unbranded.html'

    await upgradeIfUnchanged([
      { filePath: unbrandedLayout, action: 'delete' }
    ])

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
