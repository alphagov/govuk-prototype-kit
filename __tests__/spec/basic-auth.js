/* eslint-env jest */
const request = require('supertest')
let app = require('../../server.js')

/**
 * Check that basic auth is configured correctly
 */
describe('The Prototype Kit - Basic Auth', () => {
  describe('misconfigured server  - no user name or password set', () => {
    beforeAll(() => {
      jest.resetModules() // most important part!! invalidates previous cached required modules
      process.env.NODE_ENV = 'production'
      process.env.USE_AUTH = 'true'
      app = require('../../server.js')
    })

    afterAll(() => {
      app.close()
    })

    it('should return 302 because forceHTTP redirects first', async () => {
      const response = await request(app)
        .get('/')
        .auth('the-username', 'the-password')
      expect(response.statusCode).toBe(302)
    })

    it('should return HTML', async () => {
      const response = await request(app)
        .get('/')
        .auth('the-username', 'the-password')
      expect(response.type).toBe('text/plain')
    })
  })

  xdescribe('user provides invalid creditials', () => {
    xdescribe('incorrect username', () => {
      it('should return 401', () => {

      })
      it('should return a header WWW-Authenticate set', () => {})
    })
    xdescribe('incorrect password', () => {
      it('should return 401', () => {})
      it('should return a header WWW-Authenticate set', () => {})
    })
  })

  describe('user provides valid creditials', () => {
    it('should return 200', () => {})
    it('should return HTML', () => {})
  })
})
