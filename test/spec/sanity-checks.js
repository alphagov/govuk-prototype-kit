/* eslint-env mocha */
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
describe('The Prototype Kit', function () {
  it('should generate assets into the /public folder', function () {
    assert.doesNotThrow(function () {
      fs.accessSync(path.resolve(__dirname, '../../public/javascripts/application.js'))
      fs.accessSync(path.resolve(__dirname, '../../public/images/unbranded.ico'))
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

  it('should allow known assets to be loaded from node_modules', function (done) {
    request(app)
      .get('/extension-assets/govuk-frontend/all.js')
      .expect('Content-Type', /application\/javascript; charset=UTF-8/)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err)
        } else {
          assert.equal(res.text, readFile('node_modules/govuk-frontend/all.js'))
          done()
        }
      })
  })

  it('should allow known assets to be loaded from node_modules', function (done) {
    request(app)
      .get('/assets/images/favicon.ico')
      .expect('Content-Type', /image\/x-icon/)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err)
        } else {
          assert.equal(res.body, readFile('node_modules/govuk-frontend/assets/images/favicon.ico'))
          done()
        }
      })
  })

  it('should not expose everything', function (done) {
    request(app)
      .get('/extension-assets/govuk-frontend/common.js')
      .expect(404)
      .end(function (err, res) {
        if (err) {
          done(err)
        } else {
          done()
        }
      })
  })
})
