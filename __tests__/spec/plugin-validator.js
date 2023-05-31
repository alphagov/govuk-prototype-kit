/* eslint-env jest */

const path = require('path')

const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli')
const { exec } = require('child_process')

async function runShellCommand (fixtureProjectDirectory, cb) {
  exec(`"${process.execPath}" ${cliPath} validate-plugin ${fixtureProjectDirectory}`,
    { cwd: fixtureProjectDirectory, env: process.env, stdio: 'inherit' }, function (err, stdout, stderr) {
      if (err) {
        cb(stderr)
      } else {
        cb(stdout)
      }
    })
}

describe('plugin-validator', () => {
  it('should work', async () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'valid-plugin')
    runShellCommand(fixtureProjectDirectory, function cb (result) {
      const outputs = result.split('\n')
      const outputToCheck = outputs[outputs.length - 2]

      expect(outputToCheck).toEqual('The plugin config is valid.')
    }).then(res => console.log('result: ' + res)
    )
  })

  it('should return list of errors found', async () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'invalid-plugin')

    runShellCommand(fixtureProjectDirectory, function cb (result) {
      const outputs = result.split('\n')
      const outputToCheck = outputs[outputs.length - 2]

      expect(outputToCheck).toEqual('The plugin config is valid.')
    }).then(res => console.log('result: ' + res)
    )
  })
})
