/* eslint-env jest */
var request = require('supertest')
var app = require('../../server.js')
var path = require('path')
var fs = require('fs')
var assert = require('assert')

function readFile (pathFromRoot) {
  return fs.readFileSync(path.join(__dirname, '../../' + pathFromRoot), 'utf8')
}
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

  describe('extensions', () => {
    it('should allow known assets to be loaded from node_modules', (done) => {
      request(app)
        .get('/extension-assets/govuk-frontend/all.js')
        .expect('Content-Type', /application\/javascript; charset=UTF-8/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err)
          } else {
            assert.strictEqual('' + res.text, readFile('node_modules/govuk-frontend/all.js'))
            done()
          }
        })
    })

    it('should allow known assets to be loaded from node_modules', (done) => {
      request(app)
        .get('/assets/images/favicon.ico')
        .expect('Content-Type', /image\/x-icon/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err)
          } else {
            assert.strictEqual('' + res.body, readFile('node_modules/govuk-frontend/assets/images/favicon.ico'))
            done()
          }
        })
    })

    it('should not expose everything', function (done) {
      request(app)
        .get('/assets/common.js')
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err)
          } else {
            done()
          }
        })
    })

    describe('misconfigured prototype kit - while upgrading kit developer did not copy over changes in /app folder', () => {
      it('should still allow known assets to be loaded from node_modules', (done) => {
        request(app)
          .get('/node_modules/govuk-frontend/all.js')
          .expect('Content-Type', /application\/javascript; charset=UTF-8/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              assert.strictEqual('' + res.text, readFile('node_modules/govuk-frontend/all.js'))
              done()
            }
          })
      })
    })
  })
})
