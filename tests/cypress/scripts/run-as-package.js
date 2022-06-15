const child_process = require('child_process') // eslint-disable-line camelcase
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')

const prototypePkg = require('../../package.json')
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

// Copy the files in the installed releaseArchive app folder into an app folder in the project
const srcDir = path.join('.', 'node_modules', prototypePkg.name, 'app')
const destDir = path.join('.', 'app')

fs.mkdirSync(destDir, {
  recursive: true
})

fse.copySync(srcDir, destDir, {
  overwrite: true
})

child_process.execSync(
  `node ${path.join('.', 'node_modules', prototypePkg.name, 'start.js')}`,
  { cwd: testDir, env: { ...process.env, env: 'test' }, stdio: 'inherit' }
)
