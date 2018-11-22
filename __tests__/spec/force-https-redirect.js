/* eslint-env jest */
var request = require('supertest')
var app = require('../../server.js')

describe('The Prototype Kit - force HTTPS redirect functionality', () => {
  describe('should in a production environment', () => {
    beforeAll(() => {
      jest.resetModules()
      process.env.NODE_ENV = 'production'
      process.env.USE_HTTPS = 'true'
      app = require('../../server.js')
    })
    afterAll((done) => {
      app.close(done)
    })

    it('have HTTP header "location" field that begins with https', async () => {
      const response = await request(app).get('/docs')
      expect(response.header['location'].startsWith('https://')).toBeTruthy()
    })

    it('redirect to the same HTTPS url', async () => {
      const response = await request(app).get('/docs')
      expect(response.header['location'].endsWith('/docs')).toBeTruthy()
    })

    it('have HTTP header "status" field that indicates a redirect', async () => {
      const response = await request(app).get('/docs')
      expect(response.statusCode).toBe(302)
    })
  })
})
