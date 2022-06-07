/* eslint-env jest */

const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const path = require('path')

const utils = require('./utils')

describe('npm install', () => {
  const tmpDir = utils.mkdtempSync()

  it('does not install dev dependencies by default', () => {
    const testDir = path.join(tmpDir, 'install-no-optional')
    utils.mkPrototypeSync(testDir)

    child_process.execSync(
      'npm install',
      { cwd: testDir, env: { LANG: process.env.LANG, PATH: process.env.PATH } }
    )

    expect(
      fs.existsSync(path.join(testDir, 'node_modules', 'jest'))
    ).toBe(false)
  })
})
