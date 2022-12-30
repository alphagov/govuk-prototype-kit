/* eslint-env jest */
/* eslint-disable no-prototype-builtins */

// core dependencies
const path = require('path')

// local dependencies
const config = require('../config')
const plugins = require('./plugins')
const fakeFileSystem = require('../../__tests__/utils/mock-file-system')

// Local variables
const rootPath = path.join(__dirname, '..', '..')
const pkg = `{
  "dependencies": {
    "govuk-frontend": "^4.3.0"
  }
}
`
let testScope

// helpers
const joinPaths = arr => arr.map(x => path.join.apply(null, [rootPath].concat(x)))

describe('plugins', () => {
  beforeEach(() => {
    testScope = {
      appConfig: {
        basePlugins: ['govuk-frontend']
      },
      fileSystem: fakeFileSystem.mockFileSystem(rootPath)
    }
    testScope.fileSystem.writeFile(['package.json'], pkg)
    testScope.fileSystem.writeFile(['node_modules', 'govuk-frontend', 'govuk-prototype-kit.config.json'], '{"nunjucksPaths": ["/"],"scripts": ["/govuk/all.js"],"assets": ["/govuk/assets"],"sass": ["/govuk/all.scss"]}')
    testScope.fileSystem.setupSpies()
    jest.spyOn(config, 'getConfig').mockImplementation(() => {
      return testScope.appConfig
    })
    plugins.setPluginsByType()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Lookup file system paths', () => {
    it('should lookup asset paths as file system paths', () => {
      expect(plugins.getFileSystemPaths('assets')).toEqual(joinPaths([
        ['node_modules', 'govuk-frontend', 'govuk', 'assets']
      ]))
    })
    it('should not allow traversing the file system', () => {
      mockPluginConfig('govuk-frontend', { assets: ['/abc/../../../../../def'] })
      expect(plugins.getFileSystemPaths('assets')).toEqual(joinPaths([
        ['node_modules', 'govuk-frontend', 'abc', 'def']
      ]))
    })
    it('should show installed plugins asset paths as file system paths', () => {
      delete config.basePlugins
      mockPluginConfig('another-frontend', {
        assets: ['/abc', '/def']
      })
      mockPluginConfig('hmrc-frontend', {
        assets: ['/ghi', '/jkl']
      })
      expect(plugins.getFileSystemPaths('assets')).toEqual(joinPaths([
        ['node_modules', 'govuk-frontend', 'govuk', 'assets'],
        ['node_modules', 'another-frontend', 'abc'],
        ['node_modules', 'another-frontend', 'def'],
        ['node_modules', 'hmrc-frontend', 'ghi'],
        ['node_modules', 'hmrc-frontend', 'jkl']
      ]))
    })
    it('should follow strict alphabetical order when no base plugins used', () => {
      testScope.appConfig.basePlugins = []
      mockPluginConfig('another-frontend', {
        assets: ['/abc', '/def']
      })
      mockPluginConfig('hmrc-frontend', {
        assets: ['/ghi', '/jkl']
      })
      expect(plugins.getFileSystemPaths('assets')).toEqual(joinPaths([
        ['node_modules', 'another-frontend', 'abc'],
        ['node_modules', 'another-frontend', 'def'],
        ['node_modules', 'govuk-frontend', 'govuk', 'assets'],
        ['node_modules', 'hmrc-frontend', 'ghi'],
        ['node_modules', 'hmrc-frontend', 'jkl']
      ]))
    })
    it('should put specified basePlugins at the top', () => {
      testScope.appConfig.basePlugins = ['hmrc-frontend', 'govuk-frontend']
      mockPluginConfig('another-frontend', {
        assets: ['/abc', '/def']
      })
      mockPluginConfig('hmrc-frontend', {
        assets: ['/ghi', '/jkl']
      })
      expect(plugins.getFileSystemPaths('assets')).toEqual(joinPaths([
        ['node_modules', 'hmrc-frontend', 'ghi'],
        ['node_modules', 'hmrc-frontend', 'jkl'],
        ['node_modules', 'govuk-frontend', 'govuk', 'assets'],
        ['node_modules', 'another-frontend', 'abc'],
        ['node_modules', 'another-frontend', 'def']
      ]))
    })
    it('should show installed plugins asset paths as file system paths', () => {
      mockPluginConfig('hmrc-frontend', {
        assets: ['/abc', '/def']
      })
      expect(plugins.getFileSystemPaths('assets')).toEqual(joinPaths([
        ['node_modules', 'govuk-frontend', 'govuk', 'assets'],
        ['node_modules', 'hmrc-frontend', 'abc'],
        ['node_modules', 'hmrc-frontend', 'def']
      ]))
    })
    it('should lookup scripts paths as file system paths', () => {
      expect(plugins.getFileSystemPaths('scripts')).toEqual(joinPaths([
        'node_modules/govuk-frontend/govuk/all.js'
      ]))
    })
    it('should not break when asking for an plugin key which isn\'t used', () => {
      expect(plugins.getFileSystemPaths('thisListDoesNotExist')).toEqual([])
    })
  })

  describe('Lookup public URLs', () => {
    it('should show installed plugins asset paths as file system paths', () => {
      delete config.basePlugins
      mockPluginConfig('another-frontend', {
        assets: ['/abc', '/def']
      })
      mockPluginConfig('hmrc-frontend', {
        assets: ['/ghi', '/jkl']
      })
      expect(plugins.getPublicUrls('assets')).toEqual([
        '/plugin-assets/govuk-frontend/govuk/assets',
        '/plugin-assets/another-frontend/abc',
        '/plugin-assets/another-frontend/def',
        '/plugin-assets/hmrc-frontend/ghi',
        '/plugin-assets/hmrc-frontend/jkl'
      ])
    })
    it('should follow strict alphabetical order when no base plugins used', () => {
      testScope.appConfig.basePlugins = []
      mockPluginConfig('another-frontend', {
        assets: ['/abc', '/def']
      })
      mockPluginConfig('hmrc-frontend', {
        assets: ['/ghi', '/jkl']
      })
      expect(plugins.getPublicUrls('assets')).toEqual([
        '/plugin-assets/another-frontend/abc',
        '/plugin-assets/another-frontend/def',
        '/plugin-assets/govuk-frontend/govuk/assets',
        '/plugin-assets/hmrc-frontend/ghi',
        '/plugin-assets/hmrc-frontend/jkl'
      ])
    })
    it('should put specified basePlugins at the top', () => {
      testScope.appConfig.basePlugins = ['hmrc-frontend', 'govuk-frontend']
      mockPluginConfig('another-frontend', {
        assets: ['/abc', '/def']
      })
      mockPluginConfig('hmrc-frontend', {
        assets: ['/ghi', '/jkl']
      })
      expect(plugins.getPublicUrls('assets')).toEqual([
        '/plugin-assets/hmrc-frontend/ghi',
        '/plugin-assets/hmrc-frontend/jkl',
        '/plugin-assets/govuk-frontend/govuk/assets',
        '/plugin-assets/another-frontend/abc',
        '/plugin-assets/another-frontend/def'
      ])
    })
    it('should url encode each part', () => {
      mockPluginConfig('mine', { assets: ['/abc:def'] })
      mockUninstallPlugin('govuk-frontend')

      expect(plugins.getPublicUrls('assets')).toEqual(['/plugin-assets/mine/abc%3Adef'])
    })
  })

  describe('Lookup public URLs with file system paths', () => {
    it('should show installed plugins asset paths as file system paths', () => {
      delete config.basePlugins
      mockPluginConfig('another-frontend', {
        assets: ['/abc', '/def']
      })
      mockPluginConfig('hmrc-frontend', {
        assets: ['/ghi', '/jkl']
      })
      expect(plugins.getPublicUrlAndFileSystemPaths('assets')).toEqual([
        {
          publicUrl: '/plugin-assets/govuk-frontend/govuk/assets',
          fileSystemPath: path.join(rootPath, 'node_modules', 'govuk-frontend', 'govuk', 'assets')
        },
        {
          publicUrl: '/plugin-assets/another-frontend/abc',
          fileSystemPath: path.join(rootPath, 'node_modules', 'another-frontend', 'abc')
        },
        {
          publicUrl: '/plugin-assets/another-frontend/def',
          fileSystemPath: path.join(rootPath, 'node_modules', 'another-frontend', 'def')
        },
        {
          publicUrl: '/plugin-assets/hmrc-frontend/ghi',
          fileSystemPath: path.join(rootPath, 'node_modules', 'hmrc-frontend', 'ghi')
        },
        {
          publicUrl: '/plugin-assets/hmrc-frontend/jkl',
          fileSystemPath: path.join(rootPath, 'node_modules', 'hmrc-frontend', 'jkl')
        }
      ])
    })
    it('should follow strict alphabetical order when no base plugins used', () => {
      testScope.appConfig.basePlugins = []
      mockPluginConfig('another-frontend', {
        assets: ['/abc', '/def']
      })
      mockPluginConfig('hmrc-frontend', {
        assets: ['/ghi', '/jkl']
      })
      expect(plugins.getPublicUrlAndFileSystemPaths('assets')).toEqual([
        {
          publicUrl: '/plugin-assets/another-frontend/abc',
          fileSystemPath: path.join(rootPath, 'node_modules', 'another-frontend', 'abc')
        },
        {
          publicUrl: '/plugin-assets/another-frontend/def',
          fileSystemPath: path.join(rootPath, 'node_modules', 'another-frontend', 'def')
        },
        {
          publicUrl: '/plugin-assets/govuk-frontend/govuk/assets',
          fileSystemPath: path.join(rootPath, 'node_modules', 'govuk-frontend', 'govuk', 'assets')
        },
        {
          publicUrl: '/plugin-assets/hmrc-frontend/ghi',
          fileSystemPath: path.join(rootPath, 'node_modules', 'hmrc-frontend', 'ghi')
        },
        {
          publicUrl: '/plugin-assets/hmrc-frontend/jkl',
          fileSystemPath: path.join(rootPath, 'node_modules', 'hmrc-frontend', 'jkl')
        }
      ])
    })
    it('should put specified basePlugins at the top', () => {
      testScope.appConfig.basePlugins = ['hmrc-frontend', 'govuk-frontend']
      mockPluginConfig('another-frontend', {
        assets: ['/abc', '/def']
      })
      mockPluginConfig('hmrc-frontend', {
        assets: ['/ghi', '/jkl']
      })
      expect(plugins.getPublicUrlAndFileSystemPaths('assets')).toEqual([
        {
          publicUrl: '/plugin-assets/hmrc-frontend/ghi',
          fileSystemPath: path.join(rootPath, 'node_modules', 'hmrc-frontend', 'ghi')
        },
        {
          publicUrl: '/plugin-assets/hmrc-frontend/jkl',
          fileSystemPath: path.join(rootPath, 'node_modules', 'hmrc-frontend', 'jkl')
        },
        {
          publicUrl: '/plugin-assets/govuk-frontend/govuk/assets',
          fileSystemPath: path.join(rootPath, 'node_modules', 'govuk-frontend', 'govuk', 'assets')
        },
        {
          publicUrl: '/plugin-assets/another-frontend/abc',
          fileSystemPath: path.join(rootPath, 'node_modules', 'another-frontend', 'abc')
        },
        {
          publicUrl: '/plugin-assets/another-frontend/def',
          fileSystemPath: path.join(rootPath, 'node_modules', 'another-frontend', 'def')
        }
      ])
    })
    it('should url encode each part', () => {
      mockPluginConfig('mine', { assets: ['/abc:def'] })
      mockUninstallPlugin('govuk-frontend')

      expect(plugins.getPublicUrls('assets')).toEqual(['/plugin-assets/mine/abc%3Adef'])
    })
    it('should not break when asking for an plugin key which isn\'t used', () => {
      expect(plugins.getPublicUrls('anotherListThatDoesntExist')).toEqual([])
    })
  })

  describe('getAppViews', () => {
    it('should be a function', () => {
      expect(plugins.getAppViews).toBeInstanceOf(Function)
    })

    it('should output govuk-frontend nunjucks paths as an array', () => {
      expect(plugins.getAppViews()).toEqual(joinPaths([
        '.tmp/shadow-nunjucks/govuk-frontend',
        'node_modules/govuk-frontend'
      ]))
    })

    it('should also output hmcts-frontend nunjucks paths after it is installed', () => {
      mockPluginConfig('hmcts-frontend', {
        nunjucksPaths: [
          '/my-components',
          '/my-layouts'
        ]
      })

      expect(plugins.getAppViews()).toEqual(joinPaths([
        '.tmp/shadow-nunjucks/hmcts-frontend/my-layouts',
        'node_modules/hmcts-frontend/my-layouts',
        '.tmp/shadow-nunjucks/hmcts-frontend/my-components',
        'node_modules/hmcts-frontend/my-components',
        '.tmp/shadow-nunjucks/govuk-frontend',
        'node_modules/govuk-frontend'
      ]))
    })

    it('should not output any nunjucks paths when frontends are uninstalled', () => {
      mockUninstallPlugin('govuk-frontend')

      expect(plugins.getAppViews()).toEqual([])
    })

    it('should also output provided paths in the array', () => {
      expect(plugins.getAppViews(joinPaths([
        '/app/views',
        '/lib'
      ]))).toEqual(joinPaths([
        '.tmp/shadow-nunjucks/govuk-frontend',
        'node_modules/govuk-frontend',
        '/app/views',
        '/lib'
      ]))
    })

    it('should output any provided paths in the array', () => {
      expect(plugins.getAppViews([
        '/my-new-views-directory'
      ])).toEqual([
        path.join(rootPath, '.tmp/shadow-nunjucks/govuk-frontend'),
        path.join(rootPath, 'node_modules/govuk-frontend'),
        '/my-new-views-directory'
      ])
    })
  })

  describe('default config for popular packages', () => {
    beforeEach(() => {
      // testScope.fileSystem.clear()
      mockUninstallPlugin('govuk-frontend')
    })
    describe('with nothing installed', () => {
      it('should not include public URLs for jQuery if it is not installed', () => {
        expect(plugins.getPublicUrlAndFileSystemPaths('assets')).toEqual([])
      })
      it('should not include scripts for jQuery if it is not installed', () => {
        expect(plugins.getAppConfig().scripts).toEqual([])
      })
    })
    describe('with jQuery installed', () => {
      beforeEach(() => {
        mockInstallPlugin('jquery', '3.6.0')
      })
      it('should not include public URLs for jQuery if it is not installed', () => {
        expect(plugins.getPublicUrlAndFileSystemPaths('assets')).toEqual([{
          fileSystemPath: path.resolve('node_modules', 'jquery', 'dist'),
          publicUrl: '/plugin-assets/jquery/dist'
        }])
      })
      it('should not include scripts for jQuery if it is not installed', () => {
        expect(plugins.getAppConfig().scripts).toEqual([
          '/plugin-assets/jquery/dist/jquery.js'
        ])
      })
    })
  })

  describe('getAppConfig', () => {
    it('returns an object', () => {
      expect(plugins.getAppConfig()).toBeInstanceOf(Object)
    })

    it('should have script and stylesheet keys', () => {
      expect(Object.keys(plugins.getAppConfig())).toEqual(['scripts', 'stylesheets'])
    })

    it('should return a list of public urls for the scripts', () => {
      expect(plugins.getAppConfig().scripts).toEqual([
        '/plugin-assets/govuk-frontend/govuk/all.js'
      ])
    })

    it('should return a list of public urls for the stylesheets', () => {
      expect(plugins.getAppConfig().stylesheets).toEqual([])
    })

    it('should include installed plugins where scripts config is a string array', () => {
      mockPluginConfig('my-plugin', { scripts: ['/abc/def/ghi.js'] })
      expect(plugins.getAppConfig().scripts).toEqual([
        '/plugin-assets/govuk-frontend/govuk/all.js',
        '/plugin-assets/my-plugin/abc/def/ghi.js'
      ])
    })

    it('should include installed plugins where scripts config is a string', () => {
      mockPluginConfig('my-plugin', { scripts: '/ab/cd/ef/ghi.js' })
      expect(plugins.getAppConfig().scripts).toEqual([
        '/plugin-assets/govuk-frontend/govuk/all.js',
        '/plugin-assets/my-plugin/ab/cd/ef/ghi.js'
      ])
    })

    it('should return a list of public urls for the stylesheets', () => {
      expect(plugins.getAppConfig().stylesheets).toEqual([])
    })

    it('should include installed plugins', () => {
      mockPluginConfig('my-plugin', { stylesheets: ['/abc/def/ghi.css'] })
      expect(plugins.getAppConfig().stylesheets).toEqual([
        '/plugin-assets/my-plugin/abc/def/ghi.css'
      ])
    })

    it('should allow core stylesheets and scripts to be passed in', () => {
      mockPluginConfig('my-plugin', { stylesheets: ['/abc/def/ghi.css'], scripts: ['/jkl/mno/pqr.js'] })
      expect(plugins.getAppConfig({ stylesheets: ['/a.css', '/b.css'], scripts: ['/d.js', 'e.js'] })).toEqual({
        stylesheets: [
          '/plugin-assets/my-plugin/abc/def/ghi.css',
          '/a.css',
          '/b.css'
        ],
        scripts: [
          '/plugin-assets/govuk-frontend/govuk/all.js',
          '/plugin-assets/my-plugin/jkl/mno/pqr.js',
          '/d.js',
          'e.js'
        ]
      })
    })
  })

  describe('error handling', () => {
    it('should cope with keys which aren\'t arrays', () => {
      mockPluginConfig('my-fixable-plugin', { stylesheets: '/abc.css' })
      mockPluginConfig('another-fixable-plugin', { stylesheets: '/abc.css' })

      expect(plugins.getAppConfig().stylesheets).toEqual([
        '/plugin-assets/another-fixable-plugin/abc.css',
        '/plugin-assets/my-fixable-plugin/abc.css'
      ])
    })
    it('should throw if paths use backslashes', () => {
      mockPluginConfig('my-unfixable-plugin', { stylesheets: '\\abc\\def.css' })
      mockPluginConfig('another-fixable-plugin', { stylesheets: ['/abc.css'] })

      const expectedError = new Error('Can\'t use backslashes in plugin paths - "my-unfixable-plugin" used "\\abc\\def.css".')

      expect(() => {
        plugins.getFileSystemPaths('stylesheets')
      }).toThrow(expectedError)

      expect(() => {
        plugins.getPublicUrlAndFileSystemPaths('stylesheets')
      }).toThrow(expectedError)
    })
    it('should throw if paths use backslashes further into the path', () => {
      mockPluginConfig('my-other-unfixable-plugin', { stylesheets: ['/abc\\def.css'] })
      const expectedError2 = new Error('Can\'t use backslashes in plugin paths - "my-other-unfixable-plugin" used "/abc\\def.css".')

      expect(() => {
        plugins.getFileSystemPaths('stylesheets')
      }).toThrow(expectedError2)

      expect(() => {
        plugins.getPublicUrlAndFileSystemPaths('stylesheets')
      }).toThrow(expectedError2)
    })
    it('should throw if it doesn\'t start with a forward slash', () => {
      mockPluginConfig('yet-another-unfixable-plugin', { stylesheets: ['abc.css'] })

      const noLeadingForwardSlashError = new Error('All plugin paths must start with a forward slash - "yet-another-unfixable-plugin" used "abc.css".')

      expect(() => {
        plugins.getFileSystemPaths('stylesheets')
      }).toThrow(noLeadingForwardSlashError)

      expect(() => {
        plugins.getPublicUrlAndFileSystemPaths('stylesheets')
      }).toThrow(noLeadingForwardSlashError)
    })
  })

  const mockInstallPlugin = (packageName, version = '^0.0.1') => {
    const existingPackageJson = JSON.parse(testScope.fileSystem.readFile(['package.json']))
    existingPackageJson.dependencies[packageName] = version
    testScope.fileSystem.writeFile(['package.json'], JSON.stringify(existingPackageJson))
    plugins.setPluginsByType()
  }

  const mockUninstallPlugin = (packageName) => {
    const fileContents = testScope.fileSystem.readFile(['package.json'])
    const existingPackageJson = JSON.parse(fileContents)
    if (!existingPackageJson.dependencies.hasOwnProperty(packageName)) {
      throw new Error(`Could not uninstall '${packageName}' as it is not installed`)
    }
    delete existingPackageJson.dependencies[packageName]
    testScope.fileSystem.writeFile(['package.json'], JSON.stringify(existingPackageJson))
    plugins.setPluginsByType()
  }

  const mockPluginConfig = (packageName, config = {}, version) => {
    testScope.fileSystem.writeFile(['node_modules', packageName, 'govuk-prototype-kit.config.json'], JSON.stringify(config, null, 2))
    mockInstallPlugin(packageName, version)
  }
})
