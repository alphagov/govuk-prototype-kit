const child_process = require('child_process') // eslint-disable-line camelcase
const path = require('path')

const fs = require('fs-extra')

const testDir = path.resolve(process.env.KIT_TEST_DIR || 'cypress/temp/test-project')

;(async () => {
  try {
    // Install the prototype kit cli
    child_process.execSync(
      'npm i -g',
      { cwd: path.join(__dirname, '..', '..'), env: { ...process.env, env: 'test' }, stdio: 'inherit' }
    )

    // Remove previous test starter project
    await fs.remove(testDir)

    // Create test starter project folder
    await fs.mkdirp(testDir)

    // Generate starter project and start
    child_process.execSync(
      'govuk-prototype-kit install && npm start',
      { cwd: testDir, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
    )
  } catch (error) {
    if (error.status > 0) {
      process.exitCode = error.status
    }
  }
})()
