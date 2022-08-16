const os = require('os')
const path = require('path')

const { mkPrototype, startPrototype } = require('../../__tests__/util')

const defaultKitPath = path.join(os.tmpdir(), 'cypress/temp/test-project')

const testDir = path.resolve(process.env.KIT_TEST_DIR || defaultKitPath)
mkPrototype(testDir, { overwrite: true, allowTracking: false })
startPrototype(testDir)
