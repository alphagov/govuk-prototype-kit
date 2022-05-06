/* eslint-env jest */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const glob = require('glob')
const request = require('supertest')
const sass = require('sass')

const app = require('../../server.js')
const gulpConfig = require('../../gulp/config.json')
const utils = require('../../lib/utils')

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

  describe('update script', () => {
    it('should redirect to GitHub', async () => {
      const response = await request(app).get('/docs/update.sh')
      expect(response.statusCode).toBe(302)
      expect(response.get('location')).toBe('https://raw.githubusercontent.com/alphagov/govuk-prototype-kit/main/update.sh')
    })

    it('should send a well formed response', async () => {
      const response = await request(app).get('/docs/update.sh').redirects(1)
      expect(response.statusCode).toBe(200)
    })

    it('should return plain text file', async () => {
      const response = await request(app).get('/docs/update.sh').redirects(1)
      expect(response.type).toBe('text/plain')
    })
  })

  describe('extensions', () => {
    it('should allow known assets to be loaded from node_modules', (done) => {
      request(app)
        .get('/extension-assets/govuk-frontend/govuk/all.js')
        .expect('Content-Type', /application\/javascript; charset=UTF-8/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err)
          } else {
            assert.strictEqual('' + res.text, readFile('node_modules/govuk-frontend/govuk/all.js'))
            done()
          }
        })
    })

    it('should allow known assets to be loaded from node_modules', (done) => {
      request(app)
        .get('/govuk/assets/images/favicon.ico')
        .expect('Content-Type', /image\/x-icon/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err)
          } else {
            assert.strictEqual('' + res.body, readFile('node_modules/govuk-frontend/govuk/assets/images/favicon.ico'))
            done()
          }
        })
    })

    it('should not expose everything', function (done) {
      request(app)
        .get('/govuk/assets/common.js')
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
          .get('/node_modules/govuk-frontend/govuk/all.js')
          .expect('Content-Type', /application\/javascript; charset=UTF-8/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              assert.strictEqual('' + res.text, readFile('node_modules/govuk-frontend/govuk/all.js'))
              done()
            }
          })
      })
    })
  })

  const sassFiles = glob.sync(gulpConfig.paths.assets + '/sass/*.scss')

  describe(`${gulpConfig.paths.assets}sass/`, () => {
    it.each(sassFiles)('%s renders to CSS without errors', async (file) => {
      return new Promise((resolve, reject) => {
        sass.render({
          file,
          quietDeps: true
        }, (err, result) => {
          if (err) {
            reject(err)
          } else {
            expect(result.css.length).toBeGreaterThan(1000)
            resolve()
          }
        })
      })
    })
  })

  describe('Documentation markdown page titles', () => {
    const markdownFiles = glob.sync('docs/documentation/**/*.md')
    it.each(markdownFiles)('%s has a title', (filepath) => {
      const file = readFile(filepath)
      utils.getRenderOptions(file, filepath)
    })
  })
})
