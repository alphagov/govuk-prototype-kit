const path = require('path')

const {
  getKitTestDir,
  mkPrototype,
  startPrototype,
  installExtensions,
  npmInstall
} = require('../../__tests__/util')

const testDir = getKitTestDir()

;(async () => {
  await mkPrototype(testDir, { overwrite: true, allowTracking: false })
  const fooLocation = path.join(__dirname, '..', 'fixtures', 'extensions', 'extension-foo')
  const barLocation = path.join(__dirname, '..', 'fixtures', 'extensions', 'extension-bar')
  const bazLocation = path.join(__dirname, '..', 'fixtures', 'extensions', 'extension-baz')
  await Promise.all([
    npmInstall(fooLocation),
    npmInstall(barLocation),
    npmInstall(bazLocation)
  ])
  await installExtensions(testDir, [
    '@govuk-prototype-kit/step-by-step@1',
    `"file:${fooLocation}"`,
    `"file:${barLocation}"`]
  )
  await startPrototype(testDir)
})()
