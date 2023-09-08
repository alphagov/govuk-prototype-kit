const requestHttps = require('./requestHttps')
const packageDetails = require('./packageDetails')
const {
  getLatestPluginDetailsFromNpm,
  getPluginDetailsFromGithub,
  getPluginDetailsFromFileSystem
} = require('./packageDetails')
const { mockFileSystem } = require('../../__tests__/utils/mock-file-system')
const path = require('path')
const { getPluginDetailsFromNpm } = packageDetails
const config = require('../config')

function notFound (url) {
  const error = new Error(`Bad response from ${url}`)
  error.statusCode = 404
  error.code = 'EBADRESPONSE'
  return Promise.reject(error)
}

function addExpectedLinks (config) {
  const pluginDetails = ['', 'manage-prototype', 'plugin', config.internalRef].map(encodeURIComponent).join('/').replaceAll('%3A', ':')
  return {
    ...config,
    links: {
      install: pluginDetails + '/install',
      uninstall: pluginDetails + '/uninstall',
      update: pluginDetails + '/update',
      pluginDetails
    }
  }
}

describe.only('Package Details', () => {
  let testScope
  beforeEach(() => {
    testScope = {
      jsonResultForUrl: {
        'https://registry.npmjs.org/example-plugin': {
          name: 'example-plugin',
          description: 'An example NPM package',
          'dist-tags': {
            latest: '1.0.1'
          },
          versions: {
            '1.0.0': {
              name: 'example-plugin',
              version: '1.0.0',
              description: 'An example NPM package',
              dist: {
                shasum: '8be6695eb2443505bb8fe1e1d3a01b7b8e639677',
                tarball: 'https://registry.npmjs.org/example-plugin/-/example-plugin-1.0.0.tgz',
                integrity: 'sha512-KZXSIpe+EQIrB4RBmLnL/FOI+g3QjAsuq4b0VVMhYkueW0esfa+rsAwsiCMGG4mWGy131Ejf5Jg61DeFC/PM9A==',
                signatures: [
                  {
                    keyid: 'SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA',
                    sig: 'MEQCIGyCHSLow3MXz1cJogT8P2+NMtPleu9k0hkYqaDKMGdtAiAA88G0H+Gs6y88fFenFsnJm93+9AuENeO5XZSGMHHgUQ=='
                  }
                ]
              }
            },
            '1.0.1': {
              name: 'example-plugin',
              version: '1.0.1',
              description: 'An example NPM package',
              dist: {
                shasum: '7f2872c10dbb30e2fa9fd95aabcb788ef39a223a',
                tarball: 'https://registry.npmjs.org/example-plugin/-/example-plugin-1.0.1.tgz',
                integrity: 'sha512-x+tWXVO6JFiwh+nykmGnCQqBzk+S4jh+aKiJ79uHXoouc1hkww+iqUzvjwfEhl7dW1kTie28+YakTbcmbITUzA==',
                signatures: [
                  {
                    keyid: 'SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA',
                    sig: 'MEUCIDzMp4vQnulE7D1NSpvU62JenUqkj/ptiE1xH+JTg79iAiEA0Onsp3exZb7WPrE2NB7wd6gQ3NCY5jIhTQeytz5+YH4='
                  }
                ]
              }
            }
          },
          time: {
            modified: '2022-06-19T05:31:34.523Z',
            created: '2015-02-01T00:43:35.034Z',
            '1.0.0': '2015-02-01T00:43:35.034Z',
            '1.0.2': '2015-04-03T16:05:22.839Z'
          }
        },
        'https://api.github.com/repos/x-govuk/example-plugin': {
          name: 'example-plugin',
          full_name: 'x-govuk/example-plugin',
          contents_url: 'https://api.github.com/repos/x-govuk/example-plugin/contents/{+path}',
          branches_url: 'https://api.github.com/repos/x-govuk/edit-prototype-in-browser/branches{/branch}',
          default_branch: 'main'
        },
        'https://api.github.com/repos/x-govuk/example-plugin/contents/%2Fpackage.json?ref=main': {
          content: Buffer.from(JSON.stringify({
            name: 'this-is-the-package-name',
            version: '100.200.300'
          })).toString('base64')
        },
        'https://api.github.com/repos/x-govuk/example-plugin/contents/%2Fgovuk-prototype-kit.config.json?ref=main': {
          content: Buffer.from(JSON.stringify({
            hello: 'world'
          })).toString('base64')
        },
        'https://api.github.com/repos/x-govuk/example-plugin/contents/%2Fpackage.json?ref=my-spike': {
          content: Buffer.from(JSON.stringify({
            name: 'this-is-the-package-name',
            version: '100.200.301'
          })).toString('base64')
        },
        'https://api.github.com/repos/x-govuk/example-plugin/contents/%2Fgovuk-prototype-kit.config.json?ref=my-spike': {
          content: Buffer.from(JSON.stringify({
            meta: {
              description: 'This is the plugin description.'
            }
          })).toString('base64')
        },
        'https://example.com/hello': 'Hi there'
      },
      getPluginConfigContentsFromNodeModule: {
        'https://registry.npmjs.org/example-plugin/-/example-plugin-1.0.0.tgz': {
          scripts: ['/example.js']
        },
        'https://registry.npmjs.org/example-plugin/-/example-plugin-1.0.1.tgz': {
          assets: ['/all-the-assets']
        }
      }
    }
    jest.spyOn(config, 'getConfig').mockReturnValue({
      turnOffFunctionCaching: true
    })
    jest.spyOn(requestHttps, 'requestHttpsJson').mockImplementation((url) => {
      const result = testScope.jsonResultForUrl[url]
      if (result) {
        return Promise.resolve(result)
      }
      return notFound(url)
    })
    jest.spyOn(requestHttps, 'getPluginConfigContentsFromNodeModule').mockImplementation((url) => {
      const result = testScope.getPluginConfigContentsFromNodeModule[url]
      if (result) {
        return Promise.resolve(result)
      }
      return notFound('some-url')
    })
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('httpMock', () => {
    it('should show mock response', async () => {
      expect(await requestHttps.requestHttpsJson('https://example.com/hello')).toEqual('Hi there')
    })
  })

  describe('getPluginDetailsFromNpm', () => {
    it('should represent an NPM dependency', async () => {
      expect(await getPluginDetailsFromNpm('example-plugin', '1.0.0')).toEqual(addExpectedLinks({
        exists: true,
        packageName: 'example-plugin',
        version: '1.0.0',
        name: 'Example Plugin',
        origin: 'NPM',
        legacyInstallQueryString: '?package=example-plugin&version=1.0.0',
        npmIdentifier: 'example-plugin@1.0.0',
        internalRef: 'npm:example-plugin:1.0.0',
        releaseDateTime: '2015-02-01T00:43:35.034Z',
        pluginConfig: {
          scripts: [
            '/example.js'
          ]
        },
        commands: {
          install: 'npm install example-plugin@1.0.0 --save-exact',
          uninstall: 'npm uninstall example-plugin',
          update: 'npm install example-plugin@latest --save-exact'
        }
      }))
    })
    it('should error if the no version provided', async () => {
      const expectedError = new Error('No version specified, version must be specified')

      getPluginDetailsFromNpm('example-plugin')
        .then(() => {
          throw new Error('error expected, but no error thrown')
        })
        .catch(err => {
          expect(err.message).toEqual(expectedError.message)
        })
    })
    it('should fail if the version doesn\'t exist', async () => {
      expect(await getPluginDetailsFromNpm('example-plugin', '1.0.3')).toEqual({
        exists: false
      })
    })
    it('should fail if package doesn\'t exist', async () => {
      delete testScope.jsonResultForUrl['https://registry.npmjs.org/example-plugin']
      expect(await getPluginDetailsFromNpm('example-plugin', '1.0.0')).toEqual({
        exists: false
      })
    })
  })

  describe('getLatestPluginDetailsFromNpm', () => {
    beforeEach(() => {
      testScope.mockedResult = { packageName: 'example-plugin', npmIdentifier: 'example-plugin' }
      jest.spyOn(packageDetails, 'getPluginDetailsFromNpm').mockReturnValue(testScope.mockedResult)
    })
    it('should get the latest package number and proxy', async () => {
      const result = await getLatestPluginDetailsFromNpm('example-plugin')

      expect(packageDetails.getPluginDetailsFromNpm).toHaveBeenCalledWith('example-plugin', '1.0.1')

      expect(result).toEqual({
        ...addExpectedLinks(testScope.mockedResult),
        commands: {
          install: 'npm install example-plugin --save-exact',
          uninstall: 'npm uninstall example-plugin',
          update: 'npm install example-plugin@latest --save-exact'
        },
        name: 'Example Plugin'
      })
    })
    it('should use the latest from dist-tags', async () => {
      testScope.jsonResultForUrl['https://registry.npmjs.org/example-plugin']['dist-tags'].latest = '1.0.0'
      const result = await getLatestPluginDetailsFromNpm('example-plugin')

      expect(packageDetails.getPluginDetailsFromNpm).toHaveBeenCalledWith('example-plugin', '1.0.0')

      expect(result).toEqual({
        ...addExpectedLinks(testScope.mockedResult),
        commands: {
          install: 'npm install example-plugin --save-exact',
          uninstall: 'npm uninstall example-plugin',
          update: 'npm install example-plugin@latest --save-exact'
        },
        name: 'Example Plugin'
      })
    })
    it('should fail if package doesn\'t exist', async () => {
      delete testScope.jsonResultForUrl['https://registry.npmjs.org/example-plugin']
      expect(await getLatestPluginDetailsFromNpm('example-plugin')).toEqual({
        exists: false
      })
    })
  })
  describe('getPluginDetailsFromGithub', () => {
    it('should get details from default branch', async () => {
      expect(await getPluginDetailsFromGithub('x-govuk', 'example-plugin')).toEqual(addExpectedLinks({
        exists: true,
        npmIdentifier: 'github:x-govuk/example-plugin',
        packageName: 'this-is-the-package-name',
        pluginConfig: {
          hello: 'world'
        },
        legacyInstallQueryString: '?package=this-is-the-package-name&version=github%3Ax-govuk%2Fexample-plugin',
        version: '100.200.300',
        internalRef: 'github:x-govuk:example-plugin',
        name: 'This Is The Package Name',
        origin: 'Github',
        commands: {
          install: 'npm install github:x-govuk/example-plugin --save-exact',
          uninstall: 'npm uninstall this-is-the-package-name',
          update: 'npm install this-is-the-package-name@latest --save-exact'
        }
      }))
    })
    it('should specify the branch if default branch is specified', async () => {
      expect(await getPluginDetailsFromGithub('x-govuk', 'example-plugin', 'main')).toEqual(addExpectedLinks({
        exists: true,
        npmIdentifier: 'github:x-govuk/example-plugin#main',
        packageName: 'this-is-the-package-name',
        pluginConfig: {
          hello: 'world'
        },
        legacyInstallQueryString: '?package=this-is-the-package-name&version=github%3Ax-govuk%2Fexample-plugin%23main',
        version: '100.200.300',
        internalRef: 'github:x-govuk:example-plugin:main',
        name: 'This Is The Package Name',
        origin: 'Github',
        commands: {
          install: 'npm install github:x-govuk/example-plugin#main --save-exact',
          uninstall: 'npm uninstall this-is-the-package-name',
          update: 'npm install this-is-the-package-name@latest --save-exact'
        }
      }))
    })
    it('should lookup specified branch', async () => {
      expect(await getPluginDetailsFromGithub('x-govuk', 'example-plugin', 'my-spike')).toEqual(addExpectedLinks({
        exists: true,
        npmIdentifier: 'github:x-govuk/example-plugin#my-spike',
        packageName: 'this-is-the-package-name',
        pluginConfig: {
          meta: {
            description: 'This is the plugin description.'
          }
        },
        legacyInstallQueryString: '?package=this-is-the-package-name&version=github%3Ax-govuk%2Fexample-plugin%23my-spike',
        version: '100.200.301',
        internalRef: 'github:x-govuk:example-plugin:my-spike',
        name: 'This Is The Package Name',
        origin: 'Github',
        commands: {
          install: 'npm install github:x-govuk/example-plugin#my-spike --save-exact',
          uninstall: 'npm uninstall this-is-the-package-name',
          update: 'npm install this-is-the-package-name@latest --save-exact'
        }
      }))
    })
  })
  describe('getPluginDetailsFromFileSystem', () => {
    beforeEach(() => {
      testScope.fakeDocsDir = path.join(process.cwd(), 'docs')
      testScope.fileSystem = mockFileSystem(testScope.fakeDocsDir)
      testScope.fileSystem.setupSpies()

      testScope.plugin1Path = testScope.fileSystem.createDirectory(['plugin-1'])
      testScope.fileSystem.writeFile(['plugin-1', 'package.json'], JSON.stringify({
        name: 'the-first-plugin',
        version: '80.102.3'
      }))
      testScope.fileSystem.writeFile(['plugin-1', 'govuk-prototype-kit.config.json'], JSON.stringify({
        stylesheets: ['abc.css']
      }))

      testScope.plugin2Path = testScope.fileSystem.createDirectory(['second-plugin'])
      testScope.fileSystem.writeFile(['second-plugin', 'package.json'], JSON.stringify({
        name: 'example-plugin-2',
        version: '94.1.4'
      }))
      testScope.fileSystem.writeFile(['second-plugin', 'govuk-prototype-kit.config.json'], JSON.stringify({
        meta: {
          urls: {
            documentation: 'example.com'
          }
        }
      }))
    })
    it('should output correctly for example 1', async () => {
      expect(await getPluginDetailsFromFileSystem(testScope.plugin1Path)).toEqual(addExpectedLinks({
        exists: true,
        packageName: 'the-first-plugin',
        version: '80.102.3',
        queryString: `?package=the-first-plugin&version=${encodeURIComponent(testScope.plugin1Path)}`,
        npmIdentifier: 'file:' + testScope.plugin1Path,
        internalRef: 'fs:' + testScope.plugin1Path,
        pluginConfig: {
          stylesheets: ['abc.css']
        },
        name: 'The First Plugin',
        origin: 'File System',
        commands: {
          install: `npm install file:${testScope.plugin1Path} --save-exact`,
          uninstall: 'npm uninstall the-first-plugin',
          update: 'npm install the-first-plugin@latest --save-exact'
        }
      }))
    })
    it('should output correctly for example 2', async () => {
      expect(await getPluginDetailsFromFileSystem(testScope.plugin2Path)).toEqual(addExpectedLinks({
        exists: true,
        packageName: 'example-plugin-2',
        version: '94.1.4',
        queryString: `?package=example-plugin-2&version=${encodeURIComponent(testScope.plugin2Path)}`,
        npmIdentifier: 'file:' + testScope.plugin2Path,
        internalRef: 'fs:' + testScope.plugin2Path,
        pluginConfig: {
          meta: {
            urls: {
              documentation: 'example.com'
            }
          }
        },
        name: 'Example Plugin 2',
        origin: 'File System',
        commands: {
          install: `npm install file:${testScope.plugin2Path} --save-exact`,
          uninstall: 'npm uninstall example-plugin-2',
          update: 'npm install example-plugin-2@latest --save-exact'
        }
      }))
    })
    it('should fail nicely when plugin doesn\'t exist', async () => {
      expect(await getPluginDetailsFromFileSystem(path.join(testScope.fakeDocsDir, 'plugin-3'))).toEqual({
        exists: false
      })
    })
  })
})
