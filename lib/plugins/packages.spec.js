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
const {
  getInstalledPackages,
  setPackagesCache,
  getAvailablePackages,
  getDependentPackages,
  getDependencyPackages
} = require('./packages')
const registryUrl = 'https://registry.npmjs.org/'

jest.mock('../../package.json', () => {
  return {
    dependencies: {
      '@govuk-prototype-kit/common-templates': '1.0.0'
    }
  }
})

describe('packages', () => {
  beforeEach(() => {
    setPackagesCache([])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('get packages', () => {
    const availableInstalledPackage = {
      packageName: 'available-installed-package',
      installed: true,
      available: true
    }
    const availableUninstalledPackage = {
      packageName: 'available-uninstalled-package',
      installed: false,
      available: true
    }
    const unavailableInstalledPackage = {
      packageName: 'unavailable-installed-package',
      installed: true,
      available: false,
      pluginDependencies: [availableInstalledPackage]
    }
    const unavailableUninstalledPackage = {
      packageName: 'unavailable-uninstalled-package',
      installed: false,
      available: false,
      pluginDependencies: [availableUninstalledPackage]
    }

    beforeEach(() => {
      setPackagesCache([
        availableInstalledPackage,
        availableUninstalledPackage,
        unavailableInstalledPackage,
        unavailableUninstalledPackage])
    })

    describe('getInstalledPackages', () => {
      it('', async () => {
        const installedPackages = await getInstalledPackages()
        expect(installedPackages).toEqual([availableInstalledPackage, unavailableInstalledPackage])
      })
    })

    describe('getAvailablePackages', () => {
      it('', async () => {
        const availablePackages = await getAvailablePackages()
        expect(availablePackages).toEqual([availableUninstalledPackage])
      })
    })

    describe('getDependentPackages', () => {
      it('', async () => {
        const dependentPackages = await getDependentPackages(availableInstalledPackage.packageName)
        expect(dependentPackages).toEqual([unavailableInstalledPackage])
      })
    })

    describe('getDependencyPackages', () => {
      it('', async () => {
        const dependencyPackages = await getDependencyPackages(unavailableUninstalledPackage.packageName)
        expect(dependencyPackages).toEqual([availableUninstalledPackage])
      })
    })
  })

  describe('lookupPackageInfo', () => {
    let packageJson, pluginJson

    async function mockReadJson (fullFileName) {
      const fileName = fullFileName.substring(fullFileName.lastIndexOf(path.sep) + 1)
      if (fileName === 'package.json') {
        return packageJson
      } else if (fileName === 'govuk-prototype-kit.config.json') {
        return pluginJson
      }
    }

    beforeEach(() => {
      packageJson = {
        local: true,
        version: '1.0.0'
      }
      pluginJson = {
        loaded: true
      }
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
            return undefined
        }
      })
    })

    it('lookup installed approved plugin', async () => {
      const packageName = '@govuk-prototype-kit/common-templates'

      jest.spyOn(fse, 'pathExists').mockResolvedValue(true)
      jest.spyOn(fse, 'readJson').mockImplementation(mockReadJson)

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

    it('lookup uninstalled local plugin', async () => {
      const packageName = 'local-plugin'
      const version = '/local/folder/local-plugin'
      jest.spyOn(fse, 'pathExists').mockResolvedValue(true)
      jest.spyOn(fse, 'readJson').mockImplementation(mockReadJson)
      const packageInfo = await lookupPackageInfo(packageName, version)

      expect(requestHttps.requestHttpsJson).toHaveBeenCalledWith(registryUrl + encodeURIComponent(packageName))

      expect(packageInfo).toEqual({
        available: false,
        installed: false,
        localVersion: version,
        packageJson: {
          local: true,
          version: '1.0.0'
        },
        packageName,
        pluginConfig: {
          loaded: true
        },
        required: false,
        versions: []
      })
    })
  })
})
