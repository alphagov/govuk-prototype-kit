/* eslint-env jest */

// core dependencies
const fs = require('fs')
const os = require('os')
const path = require('path')

// npm dependencies
const fse = require('fs-extra')

// local dependencies
const { exec } = require('../../lib/exec')
const { mkdtempSync } = require('../utils')
const { normaliseLineEndings } = require('../../migrator/file-helpers')

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

function getNormalisedFileContent (path) {
  return normaliseLineEndings(fs.readFileSync(path, 'utf8'))
}

describe('migrate test prototype', () => {
  beforeAll(async () => {
    fse.copySync(fixtureProjectDirectory, projectDirectory, { clobber: true })
    fse.writeJsonSync(path.join(projectDirectory, 'package.json'), pkg, { clobber: true })
    await exec(
      `"${process.execPath}" ${cliPath} migrate --version local ${projectDirectory}`,
      { cwd: projectDirectory, env: process.env, stdio: 'inherit' }
    )
  }, 240000)

  it('config.js should be replaced with config.json', () => {
    expect(fs.existsSync(path.join(appDirectory, 'config.js'))).toBe(false)

    const config = fse.readJsonSync(path.join(appDirectory, 'config.json'))

    expect(config).toEqual({
      basePlugins: [
        'govuk-prototype-kit'
      ],
      port: 3010,
      serviceName: 'Migrate test prototype'
    })
  })

  it('package.json should be created correctly', () => {
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

  it('routes.js should be updated correctly', () => {
    const routesFileContents = getNormalisedFileContent(path.join(appDirectory, 'routes.js'))

    expect(routesFileContents).toEqual(
      '//\n' +
      '// For guidance on how to create routes see:\n' +
      '// https://prototype-kit.service.gov.uk/docs/create-routes\n' +
      '//\n' +
      '\n' +
      'const govukPrototypeKit = require(\'govuk-prototype-kit\')\n' +
      'const router = govukPrototypeKit.requests.setupRouter()\n' +
      '\n' +
      '// Add your routes here\n' +
      '\n\n'
    )
  })

  it('filters.js should be overwritten', () => {
    const filtersFileContents = getNormalisedFileContent(path.join(appDirectory, 'filters.js'))

    expect(filtersFileContents).toEqual(`//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

// Add your filters here

`
    )
  })

  it('separator-2x.png should be deleted', () => {
    expect(fs.existsSync(path.join(assetsDirectory, 'images', 'separator-2x.png'))).toBe(false)
  })

  it('application.js should be overwritten', () => {
    const jsFileContents = getNormalisedFileContent(path.join(assetsDirectory, 'javascripts', 'application.js'))

    expect(jsFileContents).toEqual(`/* global GOVUK */

//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//


window.GOVUKPrototypeKit.documentReady(function () {
  // Use GOV.UK shim-links-with-button-role.js to trigger a link styled to look like a button,
  // with role="button" when the space key is pressed.
  GOVUK.shimLinksWithButtonRole.init()

  // Details/summary polyfill from frontend toolkit
  GOVUK.details.init()

  // Show and hide toggled content
  // Where .multiple-choice uses the data-target attribute
  // to toggle hidden content
  var showHideContent = new GOVUK.ShowHideContent()
  showHideContent.init()
})
`)
  })

  it('application.scss should be updated correctly', () => {
    const sassFileContents = getNormalisedFileContent(path.join(assetsDirectory, 'sass', 'application.scss'))

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

  it('layout.html should be overwritten', () => {
    const layoutFileContents = getNormalisedFileContent(path.join(appDirectory, 'views', 'layout.html'))

    expect(layoutFileContents).toEqual(
`{#
For guidance on how to use layouts see:
https://prototype-kit.service.gov.uk/docs/how-to-use-layouts
#}

{% extends "govuk-prototype-kit/layouts/govuk-branded.njk" %}
{% from "govuk/components/service-navigation/macro.njk" import govukServiceNavigation %}

{% block header %}

  {{ govukHeader() }}
  {{ govukServiceNavigation({
    serviceName: serviceName,
    serviceUrl: "/"
  })}}

{% endblock %}

{% block footer %}

  {{ govukFooter({
    meta: {
      items: footerItems,
      visuallyHiddenTitle: "Footer links"
    }
  }) }}

{% endblock %}
`
    )
  })

  it('unbranded-test.html should replace unbranded extend', () => {
    const unbrandedFileContents = getNormalisedFileContent(path.join(appDirectory, 'views', 'nested-test-folder', 'unbranded-test.html'))

    expect(unbrandedFileContents).toEqual(
      '{% extends "govuk-prototype-kit/layouts/unbranded.html" %}\n' +
      '{% block pageScripts %}\n' +
      '  <script>\n' +
      '    console.log(\'Hello Unbranded\')\n' +
      '  </script>\n' +
      '{% endblock %}'
    )
  })

  it('migrate.log does not contain user home directory', () => {
    const migrateLog = getNormalisedFileContent(path.join(projectDirectory, 'migrate.log'))

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
