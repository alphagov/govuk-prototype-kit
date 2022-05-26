/* eslint-env jest */

const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const path = require('path')

const utils = require('./utils')

describe('npm run start', () => {
  const tmpDir = utils.mkdtempSync()

  describe('prestart', () => {
    it('checks whether node modules are installed', () => {
      const testDir = path.join(tmpDir, 'check-node-modules-exists')
      utils.mkPrototypeSync(testDir)

      expect(() => {
        child_process.execSync('npm run start', { cwd: testDir })
      }).toThrow('ERROR: Node module folder missing. Try running `npm install`')

      fs.mkdirSync(path.join(testDir, 'node_modules'))

      expect(() => {
        child_process.execSync('npm run predev', { cwd: testDir })
      }).not.toThrow()
    })
  })
})
