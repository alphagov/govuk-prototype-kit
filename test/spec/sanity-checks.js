/* eslint-env mocha */
var request = require('supertest')
var app = require('../../server.js')
var path = require('path')
var fs = require('fs')
var assert = require('assert')

/**
 * Basic sanity checks on the dev server
 */
describe('The prototype kit', function () {
  it('should generate assets into the /public folder', function () {
    assert.doesNotThrow(function () {
      fs.accessSync(path.resolve(__dirname, '../../public/javascripts/application.js'))
      fs.accessSync(path.resolve(__dirname, '../../public/images/favicon.ico'))
      fs.accessSync(path.resolve(__dirname, '../../public/stylesheets/application.css'))
    })
  })

  it('should send with a well formed response for the index page', function (done) {
    request(app)
      .get('/')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err)
        } else {
          done()
        }
      })
  })

  it('should send with a well formed response for the docs page', function (done) {
    request(app)
      .get('/docs')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err)
        } else {
          done()
        }
      })
  })
})
