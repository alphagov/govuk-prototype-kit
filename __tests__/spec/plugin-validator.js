/* eslint-env jest */

const path = require('path')
const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli')
const { exec } = require('child_process')

function runShellCommand (fixtureProjectDirectory) {
  return new Promise((resolve, reject) => {
    exec(`"${process.execPath}" ${cliPath} validate-plugin ${fixtureProjectDirectory}`,
      { cwd: fixtureProjectDirectory, env: process.env, stdio: 'inherit' }, function (err, stdout, stderr) {
        if (err) {
          reject(stderr)
        } else {
          resolve(stdout)
        }
      })
  })
}

describe('plugin-validator', () => {
  it('should work', async () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'valid-plugin')
    const result = await runShellCommand(fixtureProjectDirectory)
    const outputs = result.split('\n')
    const outputToCheck = outputs[outputs.length - 2]

    expect(outputToCheck).toEqual('The plugin config is valid.')
  })

  it('should return list of errors found', async () => {
    const expectedOutput = 'In section sass, the path \'/sass/_step-by-step-navigation.scss\' does not exist,In section sass, the path \'/sass/_step-by-step-navigation-header.scss\' does not exist,In section sass, the path \'/sass/_step-by-step-navigation-related.scss\' does not exist,In section scripts, the path \'javascripts/step-by-step-navigation.js\' does not start with a \'/\',In section scripts, the path \'javascripts/step-by-step-polyfills.js\' does not start with a \'/\',In section scripts, the path \'javascripts/modules/foo-module-one.js\' does not start with a \'/\',In section templates, the path \'/templates/step-by-step-navigation.html\' does not exist,In section templates, the path \'/templates/start-with-step-by-step.html\' does not exist'
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'invalid-plugin')

    const result = await runShellCommand(fixtureProjectDirectory)
    const outputs = result.split('\n')
    const outputToCheck = outputs[outputs.length - 2]

    expect(outputToCheck).toEqual(expectedOutput)
  })

  it('should return error because config does not exist', async () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'plugin-no-config')
    const result = await runShellCommand(fixtureProjectDirectory)
    const outputs = result.split('\n')
    const outputToCheck = outputs[outputs.length - 2]

    expect(outputToCheck).toEqual('The plugin does not have a govuk-prototype-kit.config.json file, all plugins must have this file to be valid.')
  })

  it('should return error because config is not a valid json', async () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'plugin-invalid-json')
    const result = await runShellCommand(fixtureProjectDirectory)
    const outputs = result.split('\n')
    const outputToCheck = outputs[outputs.length - 2]

    expect(outputToCheck).toEqual('Your govuk-prototype-kit.config.json file is not valid json.')
  })

  it('should return error because config is empty', async () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'plugin-empty-config')
    const result = await runShellCommand(fixtureProjectDirectory)
    const outputs = result.split('\n')
    const outputToCheck = outputs[outputs.length - 2]

    expect(outputToCheck).toEqual('There are no contents in your govuk-prototype.config file!')
  })
})
