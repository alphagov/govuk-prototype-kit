/* eslint-env jest */

const child_process = require('child_process') // eslint-disable-line camelcase
const path = require('path')

const utils = require('./utils')

describe('npm start', () => {
  const tmpDir = utils.mkdtempSync()

  describe('prestart', () => {
    it('checks whether node modules are installed', () => {
      const testDir = path.join(tmpDir, 'check-node-modules-exists')
      utils.mkPrototypeSync(testDir)

      expect(
        child_process.execSync('npm start', { cwd: testDir, encoding: 'utf8' })
      ).toMatch(/ERROR: Node module folder missing. Try running `npm install`\n$/)
    })
  })
})
