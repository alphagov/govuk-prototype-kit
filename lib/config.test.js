/* eslint-env jest */

// core dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')

// local dependencies
const { appDir } = require('./utils/paths')
const config = require('./config')

const appConfig = path.join(appDir, 'config.json')
const actualExistsSync = fse.existsSync
const originalEnvironmentVariables = process.env

describe('config', () => {
  const defaultConfig = Object.freeze({
    basePlugins: [
      'govuk-prototype-kit',
      'govuk-frontend'
    ],
    port: 3000,
    serviceName: 'GOV.UK Prototype Kit',
    useAuth: true,
    useHttps: true,
    useAutoStoreData: true,
    useBrowserSync: true,
    isProduction: false,
    isDevelopment: false,
    isTest: true,
    onGlitch: false,
    useNjkExtensions: false,
    logPerformance: false,
    showPrereleaseUpgrades: false,
    verbose: false
  })

  const mergeWithDefaults = (config) => Object.assign({}, defaultConfig, config)

  let testScope
  beforeEach(() => {
    testScope = {
      processEnvBackup: Object.assign({}, process.env),
      configJs: {},
      configFileExists: true
    }
    jest.spyOn(fse, 'readJsonSync').mockImplementation(() => {
      return testScope.configJs
    })

    jest.spyOn(fse, 'existsSync').mockImplementation(
      path => {
        if (path === appConfig) {
          return testScope.configFileExists
        }
        return actualExistsSync(path)
      }
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetModules()
    process.env = testScope.processEnvBackup
  })

  it('uses defaults when no config file exists', () => {
    testScope.configFileExists = false

    expect(config.getConfig()).toStrictEqual(defaultConfig)
  })

  it('allows the user to set the service name', () => {
    testScope.configJs = {
      serviceName: 'My Test Service'
    }

    expect(config.getConfig()).toStrictEqual(mergeWithDefaults({
      serviceName: 'My Test Service'
    }))
  })

  it('allows the user to set useBrowserSync', () => {
    testScope.configJs = {
      serviceName: 'My Test Service',
      useBrowserSync: false
    }

    expect(config.getConfig()).toStrictEqual(mergeWithDefaults({
      serviceName: 'My Test Service',
      useBrowserSync: false
    }))
  })

  it('allows the user to set some values in config and others in environment variables', () => {
    testScope.configJs = {
      serviceName: 'Another Test Service'
    }

    process.env.USE_BROWSER_SYNC = 'false'

    expect(config.getConfig()).toStrictEqual(mergeWithDefaults({
      serviceName: 'Another Test Service',
      useBrowserSync: false
    }))
  })

  describe('converts baseExtensions to basePlugins', () => {
    it('when baseExtensions are equal to the default basePlugins', () => {
      testScope.configJs = {
        serviceName: 'Plugins Test Service',
        baseExtensions: [
          'govuk-prototype-kit',
          'govuk-frontend'
        ]
      }

      expect(config.getConfig()).toStrictEqual(mergeWithDefaults({
        serviceName: 'Plugins Test Service'
      }))
    })

    it('when baseExtensions are not equal to the default basePlugins', () => {
      testScope.configJs = {
        serviceName: 'Plugins Test Service',
        baseExtensions: [
          'govuk-prototype-kit'
        ]
      }

      expect(config.getConfig()).toStrictEqual(mergeWithDefaults({
        serviceName: 'Plugins Test Service',
        basePlugins: [
          'govuk-prototype-kit'
        ]
      }))
    })
  })

  it('Sets the port to an number not a string', () => {
    process.env.PORT = '1234'

    expect(config.getConfig()).toStrictEqual(mergeWithDefaults({
      port: 1234
    }))
  })

  describe('onGlitch', () => {
    beforeEach(() => {
      process.env = {}
    })

    afterEach(() => {
      process.env = originalEnvironmentVariables
    })

    it('returns false if envvar PROJECT_REMIX_CHAIN is not set', () => {
      expect(config.getConfig().onGlitch).toBe(false)
    })

    it('returns true if envvar PROJECT_REMIX_CHAIN is set', () => {
      process.env.PROJECT_REMIX_CHAIN = '["dead-beef"]'
      expect(config.getConfig().onGlitch).toBe(true)
    })
  })

  describe('getNodeEnd', () => {
    beforeEach(() => {
      process.env = {}
    })

    afterEach(() => {
      process.env = originalEnvironmentVariables
    })

    it('returns the value of NODE_ENV', () => {
      process.env.NODE_ENV = 'production'
      expect(config.getConfig().isProduction).toBe(true)

      process.env.NODE_ENV = 'test'
      expect(config.getConfig().isProduction).toBe(false)
    })

    it('defaults to development if NODE_ENV is not set or empty', () => {
      expect(config.getConfig().isProduction).toBe(false)

      process.env.NODE_ENV = ''
      expect(config.getConfig().isProduction).toBe(false)
    })

    it('always returns a lower-case string', () => {
      process.env.NODE_ENV = 'FOOBAR'
      expect(config.getConfig().isProduction).toBe(false)
    })

    it('returns production if running on Glitch and NODE_ENV not set or empty', () => {
      process.env.PROJECT_REMIX_CHAIN = '["dead-beef"]'
      expect(config.getConfig().isProduction).toBe(true)

      process.env.NODE_ENV = ''
      expect(config.getConfig().isProduction).toBe(true)
    })
  })
})
