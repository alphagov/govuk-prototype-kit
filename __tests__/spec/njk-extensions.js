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

const tmpDir = path.join(mkdtempSync(), 'sanity-checks')
let app

process.env.KIT_PROJECT_DIR = tmpDir

const { packageDir, projectDir } = require('../../lib/utils/paths')
const { exec } = require('../../lib/exec')
const createKitTimeout = parseInt(process.env.CREATE_KIT_TIMEOUT || '90000', 10)
const homepageContents = '<h1>hello world!</h1>'
const notHomepageContents = '<h1>This is not the homepage!</h1>'

describe('views', () => {
  beforeAll(async () => {
    await mkPrototype(tmpDir, { allowTracking: false, overwrite: true, commandLineParameters: '--use-njk-extensions' })
    app = require(path.join(tmpDir, 'node_modules', 'govuk-prototype-kit', 'server.js'))

    jest.spyOn(fse, 'writeFileSync').mockImplementation(() => {})
    jest.spyOn(sass, 'compile').mockImplementation((css, options) => ({ css }))

    require('../../lib/build').generateAssetsSync()
  }, createKitTimeout)

  it('should have index.njk as a default when using njk extensions', (done) => {
    fse.writeFile(path.join(tmpDir, 'app', 'views', 'index.html'), notHomepageContents)
    fse.writeFile(path.join(tmpDir, 'app', 'views', 'index.njk'), homepageContents)
    fse.writeJson(path.join(tmpDir, 'app', 'config.json'), { useNjkExtensions: true })
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
