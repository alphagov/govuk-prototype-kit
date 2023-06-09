/* eslint-env jest */

const path = require('path')
const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli')
const {exec} = require('child_process')

function runShellCommand(fixtureDirectoryName) {
  const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins',fixtureDirectoryName) 
  return new Promise((resolve, reject) => {
    const abc = exec(`"${process.execPath}" ${cliPath} validate-plugin ${fixtureProjectDirectory}`,
      {env: process.env, stdio: 'inherit'}, function (err, stdout, stderr) {
        resolve({
          stdout,
          stderr,
          exitCode: abc.exitCode
        })
      })
  })
}

describe('plugin-validator', () => {
  it('should work', async () => {
    const result = await runShellCommand('valid-plugin')

    expect(result.stdout).toEqual(`
Config file exists, validating contents.
Validating whether config paths meet criteria.
The plugin config is valid.

`)
  })

  it('should return list of path errors found', async () => {
    const result = await runShellCommand('invalid-plugin')

    expect(result.exitCode).toEqual(100)
    expect(result.stderr).toEqual(`
Error: In section sass, the path '/sass/_step-by-step-navigation.scss' does not exist
Error: In section sass, the path '/sass/_step-by-step-navigation-header.scss' does not exist
Error: In section sass, the path '/sass/_step-by-step-navigation-related.scss' does not exist
Error: In section scripts, the path 'javascripts/step-by-step-navigation.js' does not start with a '/'
Error: In section scripts, the path 'javascripts/step-by-step-polyfills.js' does not start with a '/'
Error: In section scripts, the path 'javascripts/modules/foo-module-one.js' does not start with a '/'
Error: In section templates, the path '/templates/step-by-step-navigation.html' does not exist
Error: In section templates, the path '/templates/start-with-step-by-step.html' does not exist

`)
  })

  it('should return list of invalid keys', async () => {
    const result = await runShellCommand('plugin-invalid-keys')

    expect(result.exitCode).toEqual(100)
    expect(result.stderr).toEqual(`
Error: The following invalid keys exist in your config: scss,unknown-key

`)
  })

  it('should return error because config does not exist', async () => {
    const result = await runShellCommand('plugin-no-config')

    expect(result.exitCode).toEqual(100)
    expect(result.stderr).toEqual(`
Error: The plugin does not have a govuk-prototype-kit.config.json file, all plugins must have this file to be valid.

`)
  })

  it('should return error because config is not a valid json', async () => {
    const result = await runShellCommand('plugin-invalid-json')

    expect(result.exitCode).toEqual(100)
    expect(result.stderr).toEqual(`
Error: Your govuk-prototype-kit.config.json file is not valid json.

`)
  })

  it('should return error because config is empty', async () => {
    const result = await runShellCommand('plugin-empty-config')

    expect(result.exitCode).toEqual(100)
    expect(result.stderr).toEqual(`
Error: There are no contents in your govuk-prototype.config file!

`)
  })
})
