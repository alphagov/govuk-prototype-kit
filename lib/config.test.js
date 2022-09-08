/* eslint-env jest */

const fse = require('fs-extra')
const path = require('path')

const { appDir } = require('./path-utils')
const appConfig = path.join(appDir, 'config.json')
require('./config')
const config = require('./config')

const actualExistsSync = fse.existsSync

describe('config', () => {
  const defaultConfig = Object.freeze({
    baseExtensions: [
      'govuk-prototype-kit',
      'govuk-frontend',
    ],
    port: 3000,
    serviceName: 'GOV.UK Prototype Kit',
    useAuth: false,
    useAutoStoreData: true,
    useBrowserSync: true
  })

  function mergeWithDefaults (config) {
    return Object.assign({}, defaultConfig, config)
  }

  let testScope
  beforeEach(() => {
    testScope = {
      processEnvBackup: Object.assign({}, process.env),
      configJs: {
      },
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
  
  it('Sets the port to an number not a string', () => {
    process.env.PORT = '1234'
    
    expect(config.getConfig()).toStrictEqual(mergeWithDefaults({
      port: 1234
    }))
    
  })
})
