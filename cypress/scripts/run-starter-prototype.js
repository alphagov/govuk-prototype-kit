const os = require('os')
const path = require('path')

const { mkPrototype, startPrototype, installExtensions, npmInstall } = require('../../__tests__/util')

const defaultKitPath = path.join(os.tmpdir(), 'cypress/temp/test-project')

const testDir = path.resolve(process.env.KIT_TEST_DIR || defaultKitPath)

;(async () => {
  await mkPrototype(testDir, { overwrite: true, allowTracking: false })
  const fooLocation = path.join(__dirname, '..', 'fixtures', 'extensions', 'extension-foo')
  const barLocation = path.join(__dirname, '..', 'fixtures', 'extensions', 'extension-bar')
  await Promise.all([
    npmInstall(fooLocation),
    npmInstall(barLocation)
  ])
  await installExtensions(testDir, [
    '@govuk-prototype-kit/step-by-step@1',
    `"file:${fooLocation}"`,
    `"file:${barLocation}"`]
  )
  startPrototype(testDir)
})()
