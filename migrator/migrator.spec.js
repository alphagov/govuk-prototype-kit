/* eslint-env jest */

// local dependencies
const { migrate, preflightChecks } = require('./index')

jest.mock('./logger', () => {
  return {
    log: jest.fn().mockResolvedValue(true),
    setup: jest.fn().mockResolvedValue(true),
    teardown: jest.fn().mockResolvedValue(true)
  }
})

jest.mock('./migration-steps', () => {
  return {
    preflightChecks: jest.fn().mockResolvedValue(true),
    migrateConfig: jest.fn().mockResolvedValue(true),
    prepareAppRoutes: jest.fn().mockResolvedValue(true),
    prepareSass: jest.fn().mockResolvedValue(true),
    deleteUnusedFiles: jest.fn().mockResolvedValue(true),
    deleteUnusedDirectories: jest.fn().mockResolvedValue(true),
    deleteEmptyDirectories: jest.fn().mockResolvedValue([true]),
    updateIfUnchanged: jest.fn(),
    updateLayoutIfUnchanged: jest.fn().mockResolvedValue(true),
    updateIfPossible: jest.fn(),
    updateUnbrandedLayouts: jest.fn().mockResolvedValue(true),
    deleteIfUnchanged: jest.fn().mockResolvedValue([true, true, true]),
    removeOldPatternIncludesFromSassFile: jest.fn().mockResolvedValue(true)
  }
})

const migrationSteps = require('./migration-steps')

describe('migrator', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('preflightChecks', () => {
    it('successful checks', async () => {
      const success = await preflightChecks()
      expect(success).toBeTruthy()
    })

    it('unsuccessful checks', async () => {
      migrationSteps.preflightChecks.mockResolvedValue(false)
      const success = await preflightChecks()
      expect(success).toBeFalsy()
    })
  })

  describe('migrate', () => {
    beforeEach(() => {
      migrationSteps.updateIfUnchanged.mockResolvedValue([true, true, true])
    })

    it('successful migration', async () => {
      const success = await migrate()
      expect(success).toBeTruthy()
    })

    it('unsuccessful migration', async () => {
      migrationSteps.updateIfUnchanged.mockResolvedValue([true, false, true])
      const success = await migrate()
      expect(success).toBeFalsy()
    })
  })
})
