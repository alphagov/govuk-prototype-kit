/* eslint-env jest */

const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const { spawn } = require('../../lib/exec')
const os = require('os')
const { mkdtempSync } = require('../util')
const { sleep } = require('../../lib/utils')

const projectDirectory = path.join(mkdtempSync(), 'migrate-checks')
const appDirectory = path.join(projectDirectory, 'app')
const assetsDirectory = path.join(appDirectory, 'assets')
const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'test-prototype')
const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli')

const pkg = {
  name: 'govuk-prototype-kit',
  version: '11.0.0',
  dependencies: {
    'govuk-frontend': '^4.3.1',
    'govuk-prototype-kit': 'file:../../..'
  }
}

describe('migrate test prototype', () => {
  beforeAll(async () => {
    fse.copySync(fixtureProjectDirectory, projectDirectory, { clobber: true })
    fse.writeJsonSync(path.join(projectDirectory, 'package.json'), pkg, { clobber: true })
    await spawn('node', [cliPath, 'migrate', '--', projectDirectory], {
      cwd: projectDirectory,
      env: process.env,
      shell: true,
      stdio: 'inherit'
    })
    await sleep(500)
  })

  afterAll(() => {
    fse.removeSync(projectDirectory)
  })

  it('config.js to config.json', () => {
    const config = fse.readJsonSync(path.join(appDirectory, 'config.json'))

    expect(config).toEqual({
      serviceName: 'Migrate test prototype'
    })
  })

  it('routes.js', () => {
    const routesFileContents = fs.readFileSync(path.join(appDirectory, 'routes.js'), 'utf8')

    expect(routesFileContents).toEqual(
      'const router = require(\'govuk-prototype-kit\').requests.setupRouter()' +
      os.EOL + os.EOL +
      '// Add your routes here' +
      os.EOL + os.EOL + os.EOL
    )
  })

  it('filters.js', () => {
    const filtersFileContents = fs.readFileSync(path.join(appDirectory, 'filters.js'), 'utf8')

    expect(filtersFileContents).toEqual(
      'const addFilter = require(\'govuk-prototype-kit\').views.addFilter' + os.EOL
    )
  })

  it('application.js', () => {
    const jsFileContents = fs.readFileSync(path.join(assetsDirectory, 'javascripts', 'application.js'), 'utf8')

    expect(jsFileContents).toEqual(
      'window.GOVUKPrototypeKit.documentReady(() => {' + os.EOL +
      '  // Add JavaScript here' + os.EOL +
      '})' + os.EOL
    )
  })

  it('application.scss', () => {
    const sassFileContents = fs.readFileSync(path.join(assetsDirectory, 'sass', 'application.scss'), 'utf8')

    expect(sassFileContents).toEqual(
      '// Add extra styles here' +
      os.EOL + os.EOL + os.EOL
    )
  })

  it('layout.html', () => {
    const layoutFileContents = fs.readFileSync(path.join(appDirectory, 'views', 'layout.html'), 'utf8')

    expect(layoutFileContents).toEqual(
      '{% extends "govuk-prototype-kit/layouts/govuk-branded.html" %}' + os.EOL
    )
  })
})
