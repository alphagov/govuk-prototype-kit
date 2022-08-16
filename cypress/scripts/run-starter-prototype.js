const path = require('path')

const { mkPrototype } = require('../../__tests__/util')

const testDir = path.resolve(process.env.KIT_TEST_DIR || 'cypress/temp/test-project')
mkPrototype(testDir, { overwrite: true, allowTracking: false })
