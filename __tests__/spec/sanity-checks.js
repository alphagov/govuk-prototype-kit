/* eslint-env jest */

// core dependencies
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

/**
 * Basic sanity checks on the dev server
 */
describe('The Prototype Kit', () => {
  beforeAll(async () => {
    await mkPrototype(tmpDir, { allowTracking: false, overwrite: true })
    app = require(path.join(tmpDir, 'node_modules', '@nowprototypeit', 'govuk', 'server.js'))

    jest.spyOn(fse, 'writeFileSync').mockImplementation(() => {})
    jest.spyOn(sass, 'compile').mockImplementation((css, options) => ({ css }))

    require('../../lib/build').generateAssetsSync()
  }, createKitTimeout)

  afterAll(() => {
    app.close()
  })

  it('should call writeFileSync with result css from sass.compile', () => {
    expect(fse.writeFileSync).toHaveBeenCalledWith(
      path.join(projectDir, '.tmp', 'public', 'stylesheets', 'application.css'),
      path.join(packageDir, 'lib', 'assets', 'sass', 'prototype.scss')
    )
  })

  it('should initialise git out of the box', async () => {
    const outputLines = []
    await exec('git log', { cwd: tmpDir }, (data) => outputLines.push(data.toString()))

    const getLastMeaningfulLineTrimmed = (outputLines) => {
      const meaningfulLines = outputLines.join('').split('\n').filter(line => line !== '')
      return meaningfulLines.pop().trim()
    }

    expect(getLastMeaningfulLineTrimmed(outputLines)).toBe('Create prototype')
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
})
