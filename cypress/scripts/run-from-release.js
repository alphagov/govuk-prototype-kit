const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const path = require('path')

const utils = require('../../__tests__/util')

const testDir = path.resolve(process.env.KIT_TEST_DIR || 'tmp/test-prototype')

console.log('getting release archive...')
const releaseArchive = utils.mkReleaseArchiveSync({ dir: path.resolve('tmp') })
console.log(`using test release archive ${path.relative('', releaseArchive)}`)
utils.mkPrototypeSync(testDir, { archivePath: releaseArchive, overwrite: true })

console.log(`running tests in ${path.relative('', testDir)}`)
process.chdir(testDir)

fs.writeFileSync(path.join(testDir, 'usage-data-config.json'), '{ "collectUsageData": false }')

child_process.execSync(
  'npm install',
  { cwd: testDir, env: { ...process.env, npm_config_include: '' }, stdio: 'inherit' }
)

child_process.execSync(
  'npm start',
  { cwd: testDir, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
)
