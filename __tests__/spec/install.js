/* eslint-env jest */

const fs = require('fs')
const path = require('path')

const utils = require('../util')
const { exec } = require('../../lib/exec')

describe('npm install', () => {
  const tmpDir = utils.mkdtempSync()

  it('does not install dev dependencies by default', async () => {
    const testDir = path.join(tmpDir, 'install-no-optional')
    await utils.mkPrototype(testDir)

    await exec(
      'npm install',
      { cwd: testDir }
    )

    expect(
      fs.existsSync(path.join(testDir, 'node_modules', 'jest'))
    ).toBe(false)
  })
})
