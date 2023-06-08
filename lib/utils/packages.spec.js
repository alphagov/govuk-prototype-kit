/* eslint-env jest */

jest.mock('fs-extra')
jest.mock('./requestHttps')

// node dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')

// local dependencies
const packages = require('./packages')
const { lookupPackageInfo } = packages
const requestHttps = require('./requestHttps')
const registryUrl = 'https://registry.npmjs.org/'

describe('lookupPackageInfo', () => {
  beforeEach(() => {
    jest.spyOn(requestHttps, 'requestHttpsJson').mockImplementation(async (url) => {
      switch (decodeURIComponent(url.replace(registryUrl, ''))) {
        case 'jquery':
          return {
            'dist-tags': { latest: '2.0.0' },
            versions: {
              '1.0.0': { latest: false },
              '2.0.0': { latest: true }
            }
          }
        case '@govuk-prototype-kit/common-templates':
          return {
            'dist-tags': { latest: '1.0.1' },
            versions: {
              '1.0.0': { latest: false },
              '1.0.1': { latest: true }
            }
          }
        case '@govuk-prototype-kit/task-list':
          return {
            'dist-tags': { latest: '1.0.0' },
            versions: {
              '1.0.0': { latest: true }
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
      local: true
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
      available: true,
      'dist-tags': {
        latest: '1.0.1'
      },
      installed: true,
      packageJson: {
        local: true
      },
      pluginConfig: {
        loaded: true
      },
      versions: {
        '1.0.0': {
          latest: false
        },
        '1.0.1': {
          latest: true
        }
      }
    })
  })

  it('lookup uninstalled approved plugin', async () => {
    const packageName = '@govuk-prototype-kit/task-list'
    const packageInfo = await lookupPackageInfo(packageName)

    expect(requestHttps.requestHttpsJson).toHaveBeenCalledWith(registryUrl + encodeURIComponent(packageName))

    expect(packageInfo).toEqual({
      available: true,
      'dist-tags': {
        latest: '1.0.0'
      },
      installed: false,
      packageJson: {
        latest: true
      },
      versions: {
        '1.0.0': {
          latest: true
        }
      }
    })
  })

  it('lookup uninstalled approved proxy plugin', async () => {
    const packageName = 'jquery'
    const packageInfo = await lookupPackageInfo(packageName)

    expect(requestHttps.requestHttpsJson).toHaveBeenCalledWith(registryUrl + encodeURIComponent(packageName))

    expect(packageInfo).toEqual({
      available: true,
      'dist-tags': {
        latest: '2.0.0'
      },
      installed: false,
      packageJson: {
        latest: true
      },
      pluginConfig: {
        assets: [
          '/dist'
        ],
        scripts: [
          '/dist/jquery.js'
        ]
      },
      versions: {
        '1.0.0': {
          latest: false
        },
        '2.0.0': {
          latest: true
        }
      }
    })
  })
})
