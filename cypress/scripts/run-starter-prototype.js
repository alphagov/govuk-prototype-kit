// core dependencies
const os = require('os')
const path = require('path')

// local dependencies
const { mkPrototype, startPrototype, installPlugins } = require('../../__tests__/utils')

const defaultKitPath = path.join(os.tmpdir(), 'cypress', 'test-prototype')

const testDir = path.resolve(process.env.KIT_TEST_DIR || defaultKitPath)

;(async () => {
  await mkPrototype(testDir, { overwrite: true, allowTracking: false, npmInstallLinks: true })

  const fooLocation = path.join(__dirname, '..', 'fixtures', 'plugins', 'plugin-foo')
  const barLocation = path.join(__dirname, '..', 'fixtures', 'plugins', 'plugin-bar')

  await installPlugins(testDir, [
    `"file:${fooLocation}"`,
    `"file:${barLocation}"`]
  )

  if (process.argv.includes('--prodtest')) {
    await startPrototype(testDir, 'production')
  } else {
    await startPrototype(testDir)
  }
})()
