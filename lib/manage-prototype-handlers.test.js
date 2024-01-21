/* eslint-env jest */

// core dependencies
const path = require('path')

// npm dependencies
const fse = require('fs-extra')

// local dependencies
const config = require('./config')
const plugins = require('./plugins/plugins')

const pluginDetails = require('./utils/packageDetails')

const mockNunjucksRender = jest.fn()
const mockNunjucksAppEnv = jest.fn(() => ({
  render: mockNunjucksRender
}))

// Avoid hoisting with `jest.doMock()` to ensure
// Nunjucks render + environment mocks stay in scope
jest.doMock('./nunjucks/nunjucksConfiguration', () => ({
  getNunjucksAppEnv: mockNunjucksAppEnv
}))

const {
  getPasswordHandler,
  getClearDataHandler,
  postClearDataHandler,
  postPasswordHandler,
  developmentOnlyMiddleware,
  getTemplatesViewHandler,
  getTemplatesInstallHandler,
  postTemplatesInstallHandler,
  getTemplatesPostInstallHandler,
  getHomeHandler,
  getTemplatesHandler
} = require('./manage-prototype-handlers')

// mocked dependencies
jest.mock('../package.json', () => {
  return {
    version: '1.0.0',
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
      app: {
        locals: {
          serviceName: 'Service name goes here'
        }
      },
      headers: {},
      body: {},
      query: {},
      params: {},
      route: {},
      originalUrl: '/current-url',
      url: '/current-url'
    }
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      send: jest.fn()
    }
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getClearDataHandler', () => {
    getClearDataHandler(req, res)
    expect(mockNunjucksRender).toHaveBeenCalledWith(
      'views/manage-prototype/clear-data.njk',
      req.app.locals
    )
  })

  it('postClearDataHandler', () => {
    req.session = {
      data: { hasData: true }
    }
    postClearDataHandler(req, res)
    expect(req.session.data).toEqual({})
    expect(mockNunjucksRender).toHaveBeenCalledWith(
      'views/manage-prototype/clear-data-success.njk'
    )
  })

  it('getPasswordHandler', () => {
    req.query.returnUrl = '/'
    getPasswordHandler(req, res)
    expect(mockNunjucksRender).toHaveBeenCalledWith(
      'views/manage-prototype/password.njk',
      expect.objectContaining({
        ...req.app.locals,
        error: undefined,
        returnURL: '/'
      })
    )
  })

  describe('postPasswordHandler', () => {
    beforeEach(() => {
      jest.spyOn(config, 'getConfig').mockImplementation(() => ({ passwords: ['password'] }))
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
    jest.spyOn(pluginDetails, 'getLatestPluginDetailsFromNpm').mockImplementation((packageName) => {
      if (packageName === '@nowprototypeit/govuk') {
        return {
          version: '99.99.1',
          latestVersion: '99.99.1',
          links: {
            pluginDetails: '/abc'
          }
        }
      }
    })

    await getHomeHandler(req, res)
    expect(mockNunjucksRender).toHaveBeenCalledWith(
      'views/manage-prototype/index.njk',
      expect.objectContaining({
        currentSection: 'Home',
        latestAvailableKit: '99.99.1',
        kitUpdateAvailable: true,
        latestKitUrl: '/abc'
      })
    )
  })

  describe('developmentOnlyMiddleware', () => {
    it('in production', () => {
      developmentOnlyMiddleware(req, res, next)
      expect(mockNunjucksRender).toHaveBeenCalledWith(
        'views/manage-prototype/manage-prototype-not-available.njk',
        req.app.locals
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
    const templatePath = '/template'
    const encodedTemplatePath = encodeURIComponent(templatePath)
    const chosenUrl = '/chosen-url'

    beforeEach(() => {
      res.status = jest.fn().mockReturnValue(res)
      req.query.package = packageName
      req.query.template = templatePath
      plugins.getByType.mockReturnValue([{
        packageName,
        item: {
          type: 'nunjucks',
          name: templateName,
          path: templatePath
        }
      }])
    })

    it('getTemplatesHandler', async () => {
      jest.spyOn(pluginDetails, 'getInstalledPackages').mockResolvedValue([])
      await getTemplatesHandler(req, res)
      expect(mockNunjucksRender).toHaveBeenCalledWith(
        'views/manage-prototype/templates.njk',
        expect.objectContaining({
          ...req.app.locals,
          currentSection: 'Templates',
          availableTemplates: [{
            packageName,
            pluginDisplayName: { name: 'Test Package' },
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
        expect(mockNunjucksRender).toHaveBeenCalledWith(
          path.join(packageName, templatePath),
          expect.objectContaining({
            ...req.app.locals,
            serviceName: 'Service name goes here'
          })
        )
      })

      it('template not found', async () => {
        plugins.getByType.mockReturnValue([])
        await getTemplatesViewHandler(req, res)
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.send).toHaveBeenCalledWith('Template not found.')
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
          expect(mockNunjucksRender).toHaveBeenCalledWith(
            'views/manage-prototype/template-install.njk',
            expect.objectContaining({
              ...req.app.locals,
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
        expect(res.send).toHaveBeenCalledWith('Template not found.')
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
          '!$&\'()*+,;=:?#[]@.% '
            .split('')
            .map(invalidCharacter => ['invalid', `/${invalidCharacter}/abc`])
            .forEach(testPostTemplatesInstallHandler)
        })
      })
    })

    it('getTemplatesPostInstallHandler', async () => {
      req.query['chosen-url'] = chosenUrl
      await getTemplatesPostInstallHandler(req, res)
      expect(mockNunjucksRender).toHaveBeenCalledWith(
        'views/manage-prototype/template-post-install.njk',
        expect.objectContaining({
          ...req.app.locals,
          currentSection: 'Templates',
          pageName: 'Page created',
          filePath: path.join(`app/views${chosenUrl}.html`)
        })
      )
    })
  })
})
