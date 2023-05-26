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
  version: '13.0.0',
  dependencies: {
    'govuk-frontend': '^4.3.1',
    'govuk-prototype-kit': 'file:../../..'
  }
}

describe('validate test plugin', () => {
  beforeAll(async () => {
    fse.copySync(fixtureProjectDirectory, projectDirectory, { clobber: true })
    fse.writeJsonSync(path.join(projectDirectory, 'package.json'), pkg, { clobber: true })
    await exec(
    `"${process.execPath}" ${cliPath} migrate --version local ${projectDirectory}`,
    { cwd: projectDirectory, env: process.env, stdio: 'inherit' }
    )
  // Create fake plugin
  // Install fake plugin
  }, 240000)

  it('plugin should exist', () => {
  })

  it('plugin with valid config should pass the validator', () => {
  })

  it('plugin config with invald path names should fail', () => {
  })

  it('plugin config with nonexistent paths should fail', () => {
  })

  it('plugin config with unknown settings should fail', () => {
  })
})
