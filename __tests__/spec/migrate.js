/* eslint-env jest */

const fs = require('fs')
const os = require('os')
const path = require('path')

const fse = require('fs-extra')

const { spawn } = require('../../lib/exec')
const { mkdtempSync } = require('../utils')

const testDirectory = mkdtempSync()
const projectDirectory = path.join(testDirectory, 'migrate-checks')
const appDirectory = path.join(projectDirectory, 'app')
const assetsDirectory = path.join(appDirectory, 'assets')
const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'test-v11-prototype')
const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli')

const pkg = {
  name: 'test-prototype',
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

  it('package.json', () => {
    const pkgJson = fse.readJsonSync(path.join(projectDirectory, 'package.json'))

    const { dependencies, name, scripts } = pkgJson

    expect(Object.keys(dependencies)).toEqual([
      '@govuk-prototype-kit/step-by-step',
      'govuk-frontend',
      'govuk-prototype-kit',
      'jquery',
      'notifications-node-client'
    ])

    expect(scripts).toEqual({
      dev: 'govuk-prototype-kit dev',
      serve: 'govuk-prototype-kit serve',
      start: 'govuk-prototype-kit start'
    })

    expect(name).toEqual('test-prototype')
  })

  it('routes.js', () => {
    const routesFileContents = fs.readFileSync(path.join(appDirectory, 'routes.js'), 'utf8')

    expect(routesFileContents).toEqual(
      '// \n' +
      '// For guidance on how to create routes see:\n' +
      '// https://prototype-kit.service.gov.uk/docs/create-routes\n' +
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
      'https://prototype-kit.service.gov.uk/docs/how-to-use-layouts\n' +
      '#}\n' +
      '\n' +
      '{% extends "govuk-prototype-kit/layouts/govuk-branded.html" %}' + '\n'
    )
  })

  it('migrate.log does not contain user home directory', () => {
    const migrateLog = fs.readFileSync(path.join(projectDirectory, 'migrate.log'), 'utf8')

    expect(migrateLog).not.toContain(os.homedir())

    // Because we don't run the test in the home directory, we also have to do
    // a slightly different check, we make sure all paths except for the
    // metadata in the header lines are relative to the prototype directory.
    // If this is true then this should mean we won't get the home dir path.
    expect(migrateLog.split('\n').filter(
      line => line.includes(testDirectory) && !line.startsWith('argv:') && !line.startsWith('cwd:')
    )).toEqual([])
  })
})
