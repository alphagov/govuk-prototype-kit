/* eslint-env jest */

const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const { spawn } = require('../../lib/exec')
const { mkdtempSync } = require('../util')

const projectDirectory = path.join(mkdtempSync(), 'migrate-checks')
const appDirectory = path.join(projectDirectory, 'app')
const assetsDirectory = path.join(appDirectory, 'assets')
const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'test-v11-prototype')
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
    await spawn(process.execPath, [cliPath, 'migrate', '--version', 'local', projectDirectory], {
      cwd: projectDirectory,
      env: process.env,
      stdio: 'inherit'
    })
  }, 240000)

  it('config.js to config.json', () => {
    const config = fse.readJsonSync(path.join(appDirectory, 'config.json'))

    expect(config).toEqual({
      basePlugins: [
        'govuk-prototype-kit'
      ],
      port: 3010,
      serviceName: 'Migrate test prototype'
    })
  })

  it('routes.js', () => {
    const routesFileContents = fs.readFileSync(path.join(appDirectory, 'routes.js'), 'utf8')

    expect(routesFileContents).toEqual(
      '// \n' +
      '// For guidance on how to create routes see:\n' +
      '// https://prototype-kit.service.gov.uk/docs/routes\n' +
      '// \n' +
      '\n' +
      'const govukPrototypeKit = require(\'govuk-prototype-kit\')\n' +
      'const router = govukPrototypeKit.requests.setupRouter()\n' +
      '\n' +
      '// Add your routes here\n' +
      '\n\n'
    )
  })

  it('filters.js', () => {
    const filtersFileContents = fs.readFileSync(path.join(appDirectory, 'filters.js'), 'utf8')

    expect(filtersFileContents).toEqual(
      'const govukPrototypeKit = require(\'govuk-prototype-kit\')\n' +
      'const addFilter = govukPrototypeKit.views.addFilter' + '\n'
    )
  })

  it('application.js', () => {
    const jsFileContents = fs.readFileSync(path.join(assetsDirectory, 'javascripts', 'application.js'), 'utf8')

    expect(jsFileContents).toEqual(
      '//\n' +
      '// For guidance on how to add JavaScript see:\n' +
      '// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images\n' +
      '// \n' +
      '\n' +
      'window.GOVUKPrototypeKit.documentReady(() => {' + '\n' +
      '  // Add JavaScript here' + '\n' +
      '})' + '\n'
    )
  })

  it('application.scss', () => {
    const sassFileContents = fs.readFileSync(path.join(assetsDirectory, 'sass', 'application.scss'), 'utf8')

    expect(sassFileContents).toEqual(
      '//\n' +
      '// For guidance on how to add CSS and SCSS see:\n' +
      '// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images\n' +
      '// \n' +
      '\n' +
      '// Add extra styles here' +
      '\n\n\n' +
      '.my-style {\n' +
      '  font-size: large;\n' +
      '}\n' +
      '\n'
    )
  })

  it('layout.html', () => {
    const layoutFileContents = fs.readFileSync(path.join(appDirectory, 'views', 'layout.html'), 'utf8')

    expect(layoutFileContents).toEqual(
      '{#\n' +
      'For guidance on how to use layouts see:\n' +
      'https://prototype-kit.service.gov.uk/docs/layouts\n' +
      '#}\n' +
      '\n' +
      '{% extends "govuk-prototype-kit/layouts/govuk-branded.html" %}' + '\n'
    )
  })
})
