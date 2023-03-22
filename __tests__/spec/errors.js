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

  it('should show stack trace to the user in the browser and error in the terminal when error is thrown', async () => {
    testRouter.get('/error', (req, res, next) => {
      next(new Error('test error'))
    })

    const app = require('../../server.js')
    const response = await request(app).get('/error')
    // const stack = 'Error: cannot GET /error (500)\n    at Response.Object.<anonymous>.Response.toError (/Users/hannah.wood/Documents/GitHub/govuk-prototype-kit/node_modules/superagent/src/node/response.js:110:17)\n    at Response.toError [as _setStatusProperties] (/Users/hannah.wood/Documents/GitHub/govuk-prototype-kit/node_modules/superagent/src/response-base.js:107:48)\n    at new _setStatusProperties (/Users/hannah.wood/Documents/GitHub/govuk-prototype-kit/node_modules/superagent/src/node/response.js:41:8)\n    at Test.Object.<anonymous>.Request._emitResponse (/Users/hannah.wood/Documents/GitHub/govuk-prototype-kit/node_modules/superagent/src/node/index.js:952:20)\n    at IncomingMessage._emitResponse (/Users/hannah.wood/Documents/GitHub/govuk-prototype-kit/node_modules/superagent/src/node/index.js:1153:38)\n    at IncomingMessage.emit (node:events:525:35)\n    at endReadableNT (node:internal/streams/readable:1359:12)\n    at processTicksAndRejections (node:internal/process/task_queues:82:21)'
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('test error')

    expect(response.status).toBe(500)
    expect(response.text).toContain('Error: test error<br>')
    expect(response.text).toContain('govuk-prototype-kit/__tests__/spec/errors.js:35:12<br>')
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
    expect(response.text).toContain('Error: template not found: test-page.html<br>')
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
