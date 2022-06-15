const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const path = require('path')

const utils = require('../../__tests__/spec/utils')

const testDir = path.resolve(process.env.KIT_TEST_DIR || 'tmp/test-prototype')
const releaseArchive = utils.mkReleaseArchiveSync({ dir: path.resolve('cypress', 'temp') })

try {
  utils.mkPrototypeSync(testDir, { archivePath: releaseArchive })
} catch (error) {
  /* assume it is okay if prototype exists already */
  if (error.code !== 'EEXIST') {
    throw error
  }
}

process.chdir(testDir)
console.log(`running tests in ${testDir}`)

fs.writeFileSync(path.join(testDir, 'usage-data-config.json'), '{ "collectUsageData": false }')

child_process.execSync(
  'npm install',
  { cwd: testDir, env: { ...process.env, npm_config_include: '' }, stdio: 'inherit' }
)

child_process.execSync(
  'npm start',
  { cwd: testDir, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
)
