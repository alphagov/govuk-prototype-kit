/* eslint-env jest */

// npm dependencies
const request = require('supertest')
const path = require('path')

// local dependencies
const { sleep } = require('../../lib/utils')

// with NODE_ENV=test express hides error messages
process.env.NODE_ENV = 'development'
process.env.IS_INTEGRATION_TEST = 'true'

let kitRoutesApi

const getPageTitle = html => {
  const match = html.match(/<title>((.|\n|\r)*)<\/title>/)
  if (match) return match[1].trim()
}
const getH1 = html => {
  const match = html.match(/<h1.*>((.|\n|\r)*)<\/h1>/)
  if (match) return match[1].trim()
}
const getFirstParagraph = html => {
  const match = html.match(/<p .*>((.|\n|\r)*)<\/p>/)
  if (match) return match[1].trim()
}

describe('error handling', () => {
  let testRouter

  beforeEach(() => {
    jest.resetModules()

    const pluginsApi = require('../../lib/plugins/plugins')
    const sessionApi = require('../../lib/session')
    const originalGetAppViews = pluginsApi.getAppViews

    kitRoutesApi = require('../../lib/routes/api')
    kitRoutesApi.resetState()
    testRouter = kitRoutesApi.external.setupRouter()

    jest.spyOn(global.console, 'error').mockImplementation()
    jest.spyOn(sessionApi, 'getSessionMiddleware').mockReturnValue((req, res, next) => {
      req.session = {}
      next()
    })
    jest.spyOn(pluginsApi, 'getAppViews').mockImplementation(() => [
      path.join(__dirname, '..', 'fixtures', 'mockNunjucksIncludes'),
      path.join(__dirname, '..', '..', 'lib', 'nunjucks'),
      ...originalGetAppViews()
    ])
  })

  afterEach(() => {
    jest.restoreAllMocks()
    require('../../lib/nunjucks/nunjucksLoader.js').stopWatchingNunjucks()
  })

  it('should show errors to the user in both the terminal and the browser', async () => {
    testRouter.get('/error', (req, res, next) => {
      next(new Error('test error'))
    })

    const app = require('../../server.js')
    const response = await request(app).get('/error')

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('test error')

    expect(response.status).toBe(500)
    expect(getPageTitle(response.text)).toEqual('Error – GOV.UK Prototype Kit – GOV.UK Prototype Kit')
    expect(getH1(response.text)).toEqual('There is an error')
    expect(getFirstParagraph(response.text)).toMatch(/^You can try and fix this yourself or/)

    app.close()
  })

  it('shows an error if a template cannot be found', async () => {
    testRouter.get('/test-page', (req, res, next) => {
      res.render('test-page.html')
    })

    const app = require('../../server.js')
    const response = await request(app).get('/test-page')

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('template not found: test-page.html')

    expect(response.status).toBe(500)
    expect(getPageTitle(response.text)).toEqual('Error – GOV.UK Prototype Kit – GOV.UK Prototype Kit')
    expect(getH1(response.text)).toEqual('There is an error')
    expect(getFirstParagraph(response.text)).toMatch(/^You can try and fix this yourself or/)
  })

  it('shows a not found page', async () => {
    const app = require('../../server.js')
    const response = await request(app).get('/this-does-not-exist')

    expect(console.error).not.toHaveBeenCalled()

    expect(response.status).toBe(404)
    expect(getPageTitle(response.text)).toEqual('Page not found – GOV.UK Prototype Kit – GOV.UK Prototype Kit')
    expect(getH1(response.text)).toEqual('Page not found')
    expect(getFirstParagraph(response.text)).toMatch(/^There is no page at/)
  })

  it('non-fatal errors are not shown in the browser', async () => {
    testRouter.get('/non-fatal-error', (req, res, next) => {
      // an error in a background thread
      setImmediate(next, new Error('test non-fatal error'))
      res.send('OK')
    })

    const app = require('../../server.js')
    const response = await request(app).get('/non-fatal-error')

    await sleep(500) // wait for next(err) to be called

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(
      /^Error: test non-fatal error/
    ))

    expect(response.status).toBe(200)
    expect(response.text).toEqual('OK')
  })
})
