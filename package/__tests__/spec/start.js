/* eslint-env jest */

const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const path = require('path')

const utils = require('../util')

const repoDir = path.resolve(__dirname, '..', '..')

describe('npm start', () => {
  const tmpDir = utils.mkdtempSync()

  describe('prestart', () => {
    it('checks whether node modules are installed', async () => {
      const testDir = path.join(tmpDir, 'check-node-modules-exists')
      await utils.mkPrototype(testDir)

      expect(
        child_process.execSync('npm start', { cwd: testDir, encoding: 'utf8' })
      ).toMatch(/ERROR: Node module folder missing. Try running `npm install`\n$/)
    })
  })

  describe('dev server', () => {
    it('suggests running npm install if app crashes', async () => {
      const testDir = path.join(tmpDir, 'onCrash')
      await utils.mkPrototype(testDir)
      fs.symlinkSync(path.join(repoDir, 'node_modules'), path.join(testDir, 'node_modules'), 'dir')

      // add a require for an unincluded and uninstalled module
      // this should always fail
      fs.writeFileSync(
        path.join(testDir, 'listen-on-port.js'),
        "const foobar = require('foobar')\n"
      )

      const app = child_process.spawnSync(
        'node lib/build/dev-server',
        { cwd: testDir, encoding: 'utf8', shell: true, timeout: 2500 }
      )

      expect(app).toEqual(expect.objectContaining({
        stdout: expect.stringContaining('[nodemon] For missing modules try running `npm install`')
      }))
    })
  })
})
