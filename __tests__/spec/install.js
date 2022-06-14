/* eslint-env jest */

const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const path = require('path')

const utils = require('./utils')

const npmVersion = child_process.execSync(
  'npm -v', { encoding: 'utf8' }
).trim().split('.')

function testFailingIf (condition, ...args) {
  if (condition) {
    return test.failing(...args)
  } else {
    return test(...args)
  }
}

describe('npm install', () => {
  const tmpDir = utils.mkdtempSync()

  // TODO: This test can be made unconditional when we drop support for Node 14
  testFailingIf(npmVersion[0] < 8, 'does not install dev dependencies by default', () => {
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
