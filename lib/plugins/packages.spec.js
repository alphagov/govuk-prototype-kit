/* eslint-env jest */

jest.mock('fs-extra')
jest.mock('../utils/requestHttps')

// node dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')

// local dependencies
const packages = require('./packages')
const { lookupPackageInfo } = packages
const requestHttps = require('../utils/requestHttps')
const registryUrl = 'https://registry.npmjs.org/'

jest.mock('../../package.json', () => {
  return {
    dependencies: {
      '@govuk-prototype-kit/common-templates': '1.0.0'
    }
  }
})

describe('lookupPackageInfo', () => {
  beforeEach(() => {
    jest.spyOn(requestHttps, 'requestHttpsJson').mockImplementation(async (url) => {
      switch (decodeURIComponent(url.replace(registryUrl, ''))) {
        case 'jquery':
          return {
            'dist-tags': { latest: '2.0.0' },
            versions: {
              '1.0.0': { version: '1.0.0' },
              '2.0.0': { version: '2.0.0' }
            }
          }
        case '@govuk-prototype-kit/common-templates':
          return {
            'dist-tags': { latest: '1.0.1' },
            versions: {
              '1.0.0': { version: '1.0.0' },
              '1.0.1': { version: '1.0.1' }
            }
          }
        case '@govuk-prototype-kit/task-list':
          return {
            'dist-tags': { latest: '1.0.0' },
            versions: {
              '1.0.0': { version: '1.0.0' }
            }
          }
        default:
          return {}
      }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('lookup installed approved plugin', async () => {
    const packageName = '@govuk-prototype-kit/common-templates'
    const packageJson = {
      local: true,
      version: '1.0.0'
    }
    const pluginJson = {
      loaded: true
    }

    jest.spyOn(fse, 'pathExists').mockResolvedValue(true)
    jest.spyOn(fse, 'readJson').mockImplementation(async (fullFileName) => {
      const fileName = fullFileName.substring(fullFileName.lastIndexOf(path.sep) + 1)
      if (fileName === 'package.json') {
        return packageJson
      } else if (fileName === 'govuk-prototype-kit.config.json') {
        return pluginJson
      }
    })

    const packageInfo = await lookupPackageInfo(packageName)

    expect(requestHttps.requestHttpsJson).toHaveBeenCalledWith(registryUrl + encodeURIComponent(packageName))

    expect(packageInfo).toEqual({
      packageName,
      available: true,
      installed: true,
      installedLocally: false,
      installedPackageVersion: '1.0.0',
      installedVersion: '1.0.0',
      latestVersion: '1.0.1',
      required: false,
      packageJson: {
        local: true,
        version: '1.0.0'
      },
      pluginConfig: {
        loaded: true
      },
      versions: [
        '1.0.0',
        '1.0.1'
      ]
    })
  })

  it('lookup uninstalled approved plugin', async () => {
    const packageName = '@govuk-prototype-kit/task-list'
    const packageInfo = await lookupPackageInfo(packageName)

    expect(requestHttps.requestHttpsJson).toHaveBeenCalledWith(registryUrl + encodeURIComponent(packageName))

    expect(packageInfo).toEqual({
      packageName,
      available: true,
      installed: false,
      latestVersion: '1.0.0',
      required: false,
      packageJson: {
        version: '1.0.0'
      },
      versions: [
        '1.0.0'
      ]
    })
  })

  it('lookup uninstalled approved proxy plugin', async () => {
    const packageName = 'jquery'
    const packageInfo = await lookupPackageInfo(packageName)

    expect(requestHttps.requestHttpsJson).toHaveBeenCalledWith(registryUrl + encodeURIComponent(packageName))

    expect(packageInfo).toEqual({
      packageName,
      available: true,
      installed: false,
      latestVersion: '2.0.0',
      required: false,
      packageJson: {
        version: '2.0.0'
      },
      pluginConfig: {
        assets: [
          '/dist'
        ],
        scripts: [
          '/dist/jquery.js'
        ]
      },
      versions: [
        '1.0.0',
        '2.0.0'
      ]
    })
  })
})
