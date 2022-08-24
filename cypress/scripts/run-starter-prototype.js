const os = require('os')
const path = require('path')

const { mkPrototype, startPrototype, installExtensions } = require('../../__tests__/util')

const defaultKitPath = path.join(os.tmpdir(), 'cypress/temp/test-project')

const testDir = path.resolve(process.env.KIT_TEST_DIR || defaultKitPath)

;(async () => {
  await mkPrototype(testDir, { overwrite: true, allowTracking: false })
  await installExtensions(testDir, [
    '@govuk-prototype-kit/step-by-step@1',
    '"file:../../cypress/fixtures/extensions/extension-foo"']
  )
  startPrototype(testDir)
})()
