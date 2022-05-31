const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const path = require('path')

const utils = require('../../__tests__/spec/utils')

const testDir = path.resolve(process.env.KIT_TEST_DIR || 'cypress/temp/test-project')
const releaseArchive = utils.mkReleaseArchiveSync({ archiveType: 'tar', dir: path.resolve('cypress', 'temp') })

fs.mkdirSync(testDir, { recursive: true })

process.chdir(testDir)
console.log(`running tests in ${testDir}`)

fs.writeFileSync(path.join(testDir, 'package.json'), '{ "name": "test-prototype" }')
fs.writeFileSync(path.join(testDir, 'usage-data-config.json'), '{ "collectUsageData": false }')

child_process.execSync(
  `npm install ${releaseArchive} govuk-frontend`,
  { cwd: testDir, env: { ...process.env, npm_config_include: '' }, stdio: 'inherit' }
)

child_process.execSync(
  'node node_modules/govuk-prototype-kit/start.js',
  { cwd: testDir, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
)
