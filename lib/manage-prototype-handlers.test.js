/* eslint-env jest */

// core dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')
const nunjucksConfiguration = require('./nunjucks/nunjucksConfiguration')

// local dependencies
const config = require('./config')
const { requestHttpsJson } = require('./utils/requestHttps')
const exec = require('./exec')
const plugins = require('./plugins/plugins')
const packages = require('./plugins/packages')
const projectPackage = require('../package.json')
const knownPlugins = require('../known-plugins.json')

const {
  setKitRestarted,
  getPasswordHandler,
  getClearDataHandler,
  getHomeHandler,
  postClearDataHandler,
  postPasswordHandler,
  developmentOnlyMiddleware,
  getTemplatesHandler,
  getTemplatesViewHandler,
  getTemplatesInstallHandler,
  postTemplatesInstallHandler,
  getTemplatesPostInstallHandler,
  getPluginsHandler,
  postPluginsStatusHandler,
  postPluginsModeMiddleware,
  getPluginsModeHandler,
  postPluginsModeHandler
} = require('./manage-prototype-handlers')
const { projectDir } = require('./utils/paths')

// mocked dependencies
jest.mock('../package.json', () => {
  return {
    dependencies: {}
  }
})
// mocked dependencies
jest.mock('../known-plugins.json', () => {
  return {
    plugins: {}
  }
})
jest.mock('fs-extra', () => {
  return {
    readFile: jest.fn().mockResolvedValue(''),
    copy: jest.fn(),
    ensureDir: jest.fn().mockResolvedValue(true),
    exists: jest.fn().mockResolvedValue(true),
    existsSync: jest.fn().mockReturnValue(true),
    pathExistsSync: jest.fn().mockReturnValue(true),
    readJsonSync: jest.fn().mockReturnValue({})
  }
})
jest.mock('./nunjucks/nunjucksConfiguration', () => {
  return {
    getNunjucksAppEnv: jest.fn().mockImplementation(() => ({
      render: jest.fn()
    }))
  }
})
jest.mock('./utils', () => {
  return {
    encryptPassword: jest.fn().mockReturnValue('encrypted password')
  }
})
jest.mock('./utils/requestHttps', () => {
  return {
    requestHttpsJson: jest.fn()
  }
})
jest.mock('./plugins/plugins', () => {
  return {
    ...jest.requireActual('./plugins/plugins'),
    getAppViews: jest.fn(),
    getAppConfig: jest.fn(),
    getByType: jest.fn()
  }
})

jest.mock('./plugins/packages', () => {
  const availablePackage = {
    packageName: 'test-package',
    installed: false,
    available: true,
    required: false,
    latestVersion: '2.0.0',
    versions: [
      '2.0.0',
      '1.0.0'
    ],
    packageJson: {}
  }
  return {
    lookupPackageInfo: jest.fn().mockImplementation((packageName) => {
      if (packageName === availablePackage.packageName) {
        return availablePackage
      } else {
        return undefined
      }
    }),
    getInstalledPackages: jest.fn().mockResolvedValue([]),
    getAvailablePackages: jest.fn().mockResolvedValue([availablePackage]),
    getDependentPackages: jest.fn().mockResolvedValue([]),
    getDependencyPackages: jest.fn().mockResolvedValue([])
  }
})

jest.mock('./exec', () => {
  return {
    exec: jest.fn().mockReturnValue({ finally: jest.fn() })
  }
})

describe('manage-prototype-handlers', () => {
  let req, res, next

  beforeEach(() => {
    fse.exists.mockResolvedValue(true)
    fse.readJsonSync.mockReturnValue({})
    req = {
      headers: {},
      body: {},
      query: {},
      params: {},
      originalUrl: '/current-url'
    }
    res = {
      render: jest.fn(),
      redirect: jest.fn()
    }
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getClearDataHandler', () => {
    getClearDataHandler(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'views/manage-prototype/clear-data.njk'
    )
  })

  it('postClearDataHandler', () => {
    req.session = {
      data: { hasData: true }
    }
    postClearDataHandler(req, res)
    expect(req.session.data).toEqual({})
    expect(res.render).toHaveBeenCalledWith(
      'views/manage-prototype/clear-data-success.njk'
    )
  })

  it('getPasswordHandler', () => {
    req.query.returnUrl = '/'
    getPasswordHandler(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'views/manage-prototype/password.njk',
      { error: undefined, returnURL: '/' }
    )
  })

  describe('postPasswordHandler', () => {
    beforeEach(() => {
      jest.spyOn(config, 'getConfig').mockImplementation(() => ({ password: 'password' }))
    })

    it('correct password', () => {
      req.body.password = 'password'
      res.cookie = jest.fn()
      postPasswordHandler(req, res)
      expect(res.cookie).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/')
    })

    it('incorrect password', async () => {
      req.body.password = 'xxxxx'
      res.cookie = jest.fn()
      postPasswordHandler(req, res)
      expect(res.cookie).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(
        '/manage-prototype/password?error=wrong-password&returnURL=%2F'
      )
    })
  })

  it('getHomeHandler', async () => {
    packages.lookupPackageInfo.mockResolvedValue({ packageName: 'govuk-prototype-kit', latestVersion: '1.0.0' })
    await getHomeHandler(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'views/manage-prototype/index.njk',
      expect.objectContaining({ currentSection: 'Home', latestAvailableKit: '1.0.0' })
    )
  })

  describe('developmentOnlyMiddleware', () => {
    it('in production', () => {
      developmentOnlyMiddleware(req, res, next)
      expect(res.render).toHaveBeenCalledWith(
        'views/manage-prototype/manage-prototype-not-available.njk'
      )
    })

    it('in development', () => {
      jest.spyOn(config, 'getConfig').mockImplementation(() => ({ isDevelopment: true }))
      developmentOnlyMiddleware(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('templates handlers', () => {
    const packageName = 'test-package'
    const templateName = 'A page with everything'
    const pluginDisplayName = { name: 'Test Package' }
    const templatePath = '/template'
    const encodedTemplatePath = encodeURIComponent(templatePath)
    const view = 'Test View'
    const chosenUrl = '/chosen-url'
    let mockSend

    beforeEach(() => {
      mockSend = jest.fn()
      res.status = jest.fn().mockReturnValue({ send: mockSend })
      req.query.package = packageName
      req.query.template = templatePath
      res.send = mockSend
      plugins.getByType.mockReturnValue([{
        packageName,
        item: {
          type: 'nunjucks',
          name: templateName,
          path: templatePath
        }
      }])
      nunjucksConfiguration.getNunjucksAppEnv.mockImplementation(() => ({
        render: () => view
      }))
    })

    it('getTemplatesHandler', async () => {
      await getTemplatesHandler(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'views/manage-prototype/templates.njk',
        expect.objectContaining({
          currentSection: 'Templates',
          availableTemplates: [{
            packageName,
            pluginDisplayName,
            templates: [{
              installLink: `/manage-prototype/templates/install?package=${packageName}&template=${encodedTemplatePath}`,
              name: templateName,
              path: path.join(`${packageName}${templatePath}`),
              viewLink: `/manage-prototype/templates/view?package=${packageName}&template=${encodedTemplatePath}`
            }]
          }]
        })
      )
    })

    describe('getTemplatesViewHandler', () => {
      it('template found', async () => {
        await getTemplatesViewHandler(req, res)
        expect(res.status).not.toHaveBeenCalled()
        expect(mockSend).toHaveBeenCalledWith(view)
      })

      it('template not found', async () => {
        plugins.getByType.mockReturnValue([])
        await getTemplatesViewHandler(req, res)
        expect(res.status).toHaveBeenCalledWith(404)
        expect(mockSend).toHaveBeenCalledWith('Template not found.')
      })
    })

    describe('getTemplatesInstallHandler', () => {
      describe('template found', () => {
        beforeEach(() => {
          req.query['chosen-url'] = chosenUrl
        })

        async function testGetTemplatesInstallHandler (error) {
          await getTemplatesInstallHandler(req, res)
          expect(res.status).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalledWith(
            'views/manage-prototype/template-install.njk',
            expect.objectContaining({
              currentSection: 'Templates',
              pageName: 'Create new A page with everything',
              chosenUrl,
              currentUrl: req.originalUrl,
              error,
              templateName
            })
          )
        }

        it('no errors', async () => {
          await testGetTemplatesInstallHandler()
        })

        Object.entries({
          exists: 'Path already exists',
          missing: 'Enter a path',
          singleSlash: 'Path must not be a single forward slash (/)',
          endsWithSlash: 'Path must not end in a forward slash (/)',
          multipleSlashes: 'must not include a slash followed by another slash (//)',
          invalid: 'Path must not include !$&\'()*+,;=:?#[]@.% or space'
        }).forEach(([errorType, errorMessage]) => {
          it(`error type is ${errorType}`, async () => {
            req.query.errorType = errorType
            await testGetTemplatesInstallHandler(errorMessage)
          })
        })
      })

      it('template not found', async () => {
        plugins.getByType.mockReturnValue([])
        await getTemplatesInstallHandler(req, res)
        expect(res.status).toHaveBeenCalledWith(404)
        expect(mockSend).toHaveBeenCalledWith('Template not found.')
      })

      describe('postTemplatesInstallHandler', () => {
        describe('chosen url success', () => {
          beforeEach(() => {
            fse.exists.mockResolvedValue(false)
          })

          it('where chosen url starts with a forward slash', async () => {
            req.body['chosen-url'] = chosenUrl
            await postTemplatesInstallHandler(req, res)
            expect(res.redirect).toHaveBeenCalledWith(
              `/manage-prototype/templates/post-install?chosen-url=${encodeURIComponent(chosenUrl)}`
            )
          })

          it('where chosen url does not start with a forward slash', async () => {
            req.body['chosen-url'] = 'no-forward-slash'
            await postTemplatesInstallHandler(req, res)
            expect(res.redirect).toHaveBeenCalledWith(
              `/manage-prototype/templates/post-install?chosen-url=${encodeURIComponent('/no-forward-slash')}`
            )
          })
        })

        describe('chosen url failures', () => {
          const testPostTemplatesInstallHandler = ([errorType, chosenUrl]) => {
            it(`error type is ${errorType} when chosen url is "${chosenUrl}"`, async () => {
              req.body['chosen-url'] = chosenUrl
              await postTemplatesInstallHandler(req, res)
              expect(res.redirect).toHaveBeenCalledWith(
                `${req.originalUrl}?package=${packageName}&template=${encodedTemplatePath}&chosen-url=${encodeURIComponent(chosenUrl)}&errorType=${errorType}`
              )
            })
          }
          // Test each type of error
          Object.entries({
            exists: '/exists',
            missing: '',
            singleSlash: '/',
            endsWithSlash: '/slash-at-end/',
            multipleSlashes: '//multiple-slashes'
          }).forEach(testPostTemplatesInstallHandler)

          // Test each invalid character
          "!$&'()*+,;=:?#[]@.% "
            .split('')
            .map(invalidCharacter => ['invalid', `/${invalidCharacter}/abc`])
            .forEach(testPostTemplatesInstallHandler)
        })
      })
    })

    it('getTemplatesPostInstallHandler', async () => {
      req.query['chosen-url'] = chosenUrl
      await getTemplatesPostInstallHandler(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'views/manage-prototype/template-post-install.njk',
        expect.objectContaining({
          currentSection: 'Templates',
          pageName: 'Page created',
          filePath: path.join(`app/views${chosenUrl}.html`)
        })
      )
    })
  })

  describe('plugins handlers', () => {
    const csrfToken = 'x-csrf-token'
    const packageName = 'test-package'
    const latestVersion = '2.0.0'
    const previousVersion = '1.0.0'
    const pluginDisplayName = { name: 'Test Package' }
    const availablePlugin = {
      installCommand: `npm install ${packageName}`,
      installLink: `/manage-prototype/plugins/install?package=${packageName}`,
      latestVersion,
      name: pluginDisplayName.name,
      packageName,
      uninstallCommand: `npm uninstall ${packageName}`,
      updateCommand: `npm install ${packageName}@${latestVersion}`
    }

    beforeEach(() => {
      knownPlugins.plugins = { available: [packageName] }
      projectPackage.dependencies = {}
      const versions = {}
      versions[latestVersion] = {}
      versions[previousVersion] = {}
      requestHttpsJson.mockResolvedValue({
        name: packageName,
        'dist-tags': {
          latest: latestVersion,
          'latest-1': previousVersion
        },
        versions
      })
      // mocking the reading of the local package.json
      fse.readJsonSync.mockReturnValue(undefined)
      packages.lookupPackageInfo.mockResolvedValue(Promise.resolve(availablePlugin))
      res.json = jest.fn().mockReturnValue({})
    })

    it('getPluginsHandler', async () => {
      fse.readJsonSync.mockReturnValue(undefined)
      req.query.mode = 'install'
      await getPluginsHandler(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'views/manage-prototype/plugins.njk',
        expect.objectContaining({
          currentSection: 'Plugins',
          groupsOfPlugins: [
            { name: 'Installed', plugins: [], status: 'installed' },
            { name: 'Available', plugins: [availablePlugin], status: 'available' }
          ]
        })
      )
    })

    it('getPluginsModeHandler', async () => {
      req.params.mode = 'install'
      req.query.package = packageName
      req.csrfToken = jest.fn().mockReturnValue(csrfToken)
      await getPluginsModeHandler(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'views/manage-prototype/plugin-install-or-uninstall.njk',
        expect.objectContaining({
          chosenPlugin: availablePlugin,
          command: `npm install ${packageName} --save-exact`,
          currentSection: 'Plugins',
          pageName: `Install ${pluginDisplayName.name}`,
          currentUrl: req.originalUrl,
          isSameOrigin: false,
          returnLink: {
            href: '/manage-prototype/plugins',
            text: 'Back to plugins'
          }
        })
      )
    })

    describe('postPluginsModeHandler', () => {
      beforeEach(() => {
        req.params.mode = 'install'
        req.body.package = packageName
      })

      it('processing', async () => {
        await postPluginsModeHandler(req, res)
        expect(exec.exec).toHaveBeenCalledWith(
          availablePlugin.installCommand + ' --save-exact',
          { cwd: projectDir }
        )
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'processing'
          })
        )
      })

      it('processing specific version', async () => {
        packages.lookupPackageInfo.mockResolvedValue({
          packageName: 'test-package',
          installed: false,
          versions: ['1.0.0']
        })
        req.body.version = previousVersion
        const installSpecificCommand = availablePlugin.installCommand + `@${previousVersion}`
        await postPluginsModeHandler(req, res)
        expect(exec.exec).toHaveBeenCalledWith(
          installSpecificCommand + ' --save-exact',
          { cwd: projectDir }
        )
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'processing'
          })
        )
      })

      it('error invalid package', async () => {
        packages.lookupPackageInfo.mockResolvedValue(undefined)
        req.body.package = 'invalid-package'
        await postPluginsModeHandler(req, res)
        expect(exec.exec).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'error'
          })
        )
      })

      it('error invalid version', async () => {
        req.body.version = '1.0.0-invalid'
        await postPluginsModeHandler(req, res)
        expect(exec.exec).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'error'
          })
        )
      })

      it('is passed on to the postPluginsStatusHandler when status matches mode during update from 13.1 to 13.2.4 and upwards', async () => {
        req.params.mode = 'status'
        setKitRestarted(true)
        await postPluginsModeHandler(req, res)

        // req.params.mode should change to update
        expect(req.params.mode).toEqual('update')

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'processing'
          })
        )
      })
    })

    describe('postPluginsStatusHandler', () => {
      let pkg

      beforeEach(() => {
        req.params.mode = 'install'
        req.query.package = packageName
        pkg = {
          name: packageName,
          version: latestVersion,
          dependencies: { [packageName]: latestVersion }
        }
        fse.readJsonSync.mockReturnValue(pkg)
      })

      it('is processing', async () => {
        await postPluginsStatusHandler(req, res)
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'processing'
          })
        )
      })

      it('is completed', async () => {
        packages.lookupPackageInfo.mockResolvedValue({
          packageName: 'test-package',
          installedVersion: '2.0.0'
        })
        setKitRestarted(true)
        await postPluginsStatusHandler(req, res)
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'completed'
          })
        )
      })

      it('uninstall local plugin is completed', async () => {
        const localPlugin = 'local-plugin'
        req.params.mode = 'uninstall'
        req.query.package = localPlugin
        pkg.dependencies[localPlugin] = 'file:../../local-plugin'
        packages.lookupPackageInfo.mockResolvedValue({
          packageName: 'test-package',
          installed: false
        })
        setKitRestarted(true)
        await postPluginsStatusHandler(req, res)
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'completed'
          })
        )
      })
    })

    describe('postPluginsModeMiddleware', () => {
      it('with AJAX', async () => {
        req.headers['content-type'] = 'application/json'
        await postPluginsModeMiddleware(req, res, next)
        expect(next).toHaveBeenCalled()
      })

      it('without AJAX', async () => {
        req.headers['content-type'] = 'document/html'
        await postPluginsModeMiddleware(req, res, next)
        expect(res.redirect).toHaveBeenCalledWith(req.originalUrl)
      })
    })
  })
})
