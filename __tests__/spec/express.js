const request = require('supertest')

process.env.IS_INTEGRATION_TEST = 'true'

describe('Express configuration', () => {
  describe('query string parsing', () => {
    let app

    beforeAll(() => {
      // Mock the `matchRoutes` function used to serve the prototype pages
      // so we can inspect the query instead
      jest.mock('../../lib/utils', () => ({
        ...jest.requireActual('../../lib/utils'),
        matchRoutes (req, res) {
          return res.json(req.query)
        }
      }))

      app = require('../../server.js')
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('parses nested keys', async () => {
      const response = await request(app).get('/query-string?property[with][brackets]=true')
      const queryString = JSON.parse(response.text)
      expect(queryString).toEqual({
        property: {
          with: {
            brackets: 'true'
          }
        }
      })
    })
  })
})
