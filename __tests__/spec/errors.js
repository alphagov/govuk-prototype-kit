/* eslint-env jest */

// npm dependencies
const request = require('supertest')

// local dependencies
const { sleep } = require('../../lib/utils')

// with NODE_ENV=test express hides error messages
process.env.NODE_ENV = 'development'
process.env.IS_INTEGRATION_TEST = 'true'

let kitRoutesApi

describe('error handling', () => {
  let testRouter

  beforeEach(() => {
    jest.resetModules()

    kitRoutesApi = require('../../lib/routes/api')
    kitRoutesApi.resetState()
    testRouter = kitRoutesApi.external.setupRouter()

    jest.spyOn(global.console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    require('../../lib/nunjucks/nunjucksLoader.js').stopWatchingNunjucks()
  })

  it('should show error in the terminal when error is thrown', async () => {
    testRouter.get('/error', (req, res, next) => {
      next(new Error('test error'))
    })

    const app = require('../../server.js')
    const response = await request(app).get('/error')

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('test error')

    expect(response.status).toBe(500)
    app.close()
  })

  it('non-fatal errors are not shown in the browser', async () => {
    testRouter.get('/non-fatal-error', (req, res, next) => {
      // an error in a background thread
      setImmediate(next, new Error('test non-fatal error'))
      res.send('OK')
    })

    const app = require('../../server.js')
    const response = await request(app).get('/non-fatal-error')

    await sleep(1000) // wait for next(err) to be called

    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(
      /^Error: test non-fatal error/
    ))

    expect(response.status).toBe(200)
    expect(response.text).toEqual('OK')
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
    // expect(response.text).toContain('Error: template not found: test-page.html<br>')
  })
})
