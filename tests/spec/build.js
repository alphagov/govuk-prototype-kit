const child_process = require('child_process') // eslint-disable-line camelcase
const path = require('path')

describe('the build pipeline', () => {
  describe('generate assets', () => {
    it('can be run from the command line', () => {
      const proc = child_process.spawnSync(
        'node', ['lib/build/generate-assets'],
        { cwd: path.resolve(__dirname, '..', '..'), encoding: 'utf8' }
      )

      expect(proc).toEqual(expect.objectContaining(
        { status: 0 }
      ))
    })
  })
})
