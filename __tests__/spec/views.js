/* eslint-env jest */

// core dependencies
const assert = require('assert')
const path = require('path')

// npm dependencies
const fse = require('fs-extra')
const request = require('supertest')
const sass = require('sass')

// local dependencies
const { mkPrototype, mkdtempSync } = require('../utils')

const tmpDir = path.join(mkdtempSync(), 'views')
let app

process.env.KIT_PROJECT_DIR = tmpDir

const { packageDir, projectDir } = require('../../lib/utils/paths')
const { exec } = require('../../lib/exec')
const createKitTimeout = parseInt(process.env.CREATE_KIT_TIMEOUT || '90000', 10)
const homepageContents = '<h1>hello world!</h1>'
const notHomepageContents = '<h1>This is not the homepage!</h1>'

describe('views', () => {
  beforeAll(async () => {
    await mkPrototype(tmpDir, { allowTracking: false, overwrite: true })
    app = require(path.join(tmpDir, 'node_modules', 'govuk-prototype-kit', 'server.js'))

    jest.spyOn(fse, 'writeFileSync').mockImplementation(() => {})
    jest.spyOn(sass, 'compile').mockImplementation((css, options) => ({ css }))

    require('../../lib/build').generateAssetsSync()
  }, createKitTimeout)

  it('should load the homepage from index.html', (done) => {
    fse.writeFile(path.join(tmpDir, 'app', 'views', 'index.html'), homepageContents)
    request(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err)
        } else {
          assert.strictEqual(
            '' + res.text,
            homepageContents
          )
          done()
        }
      })
  })

  it('should load the homepage from index.njk', (done) => {
    fse.rmSync(path.join(tmpDir, 'app', 'views', 'index.html'))
    fse.writeFile(path.join(tmpDir, 'app', 'views', 'index.njk'), homepageContents)
    request(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err)
        } else {
          assert.strictEqual(
            '' + res.text,
            homepageContents
          )
          done()
        }
      })
  })

  it('should have index.html as default', (done) => {
    fse.writeFile(path.join(tmpDir, 'app', 'views', 'index.html'), homepageContents)
    fse.writeFile(path.join(tmpDir, 'app', 'views', 'index.njk'), notHomepageContents)
    request(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err)
        } else {
          assert.strictEqual(
            '' + res.text,
            homepageContents
          )
          done()
        }
      })
  })
})
