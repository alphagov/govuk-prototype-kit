/* eslint-env jest */
var request = require('supertest')
var app = require('../../server.js')
var path = require('path')
var fs = require('fs')
var assert = require('assert')

/**
 * Basic sanity checks on the dev server
 */
describe('The Prototype Kit', () => {
  it('should generate assets into the /public folder', () => {
    assert.doesNotThrow(function () {
      fs.accessSync(path.resolve(__dirname, '../../public/javascripts/application.js'))
      fs.accessSync(path.resolve(__dirname, '../../public/images/unbranded.ico'))
      fs.accessSync(path.resolve(__dirname, '../../public/stylesheets/application.css'))
    })
  })

  describe('index page', () => {
    it('should send a well formed response', async () => {
      const response = await request(app).get('/')
      expect(response.statusCode).toBe(200)
    })

    it('should return html file', async () => {
      const response = await request(app).get('/')
      expect(response.type).toBe('text/html')
    })
  })

  describe('docs index page', () => {
    it('should send a well formed response', async () => {
      const response = await request(app).get('/docs')
      expect(response.statusCode).toBe(200)
    })

    it('should return html file', async () => {
      const response = await request(app).get('/docs')
      expect(response.type).toBe('text/html')
    })
  })
})
