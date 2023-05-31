/* eslint-env jest */

const path = require('path')

const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli')
const { exec } = require('child_process')

async function runShellCommand (fixtureProjectDirectory, cb) {
  await exec(`"${process.execPath}" ${cliPath} validate-plugin ${fixtureProjectDirectory}`,
    { cwd: fixtureProjectDirectory, env: process.env, stdio: 'inherit' }, function (err, stdout, stderr) {
      if (err) {
        console.log('stderr: ' + stdout)
        cb(stderr)
      } else {
        console.log('stdout: ' + stdout)
        cb(stdout)
      }
    })
}

describe('plugin-validator', () => {
  it('should work', async () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'valid-plugin')
    runShellCommand(fixtureProjectDirectory, function (result) {
      // handle errors here
      expect(result[0]).toEqual('The plugin config is valid.')
    })
  })
  it('should return list of errors found', async () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'invalid-plugin')
    runShellCommand(fixtureProjectDirectory, function (result) {
      // handle errors here
      expect(result[0]).toEqual('Error in plugin:\n\n- Missing forwardslash on xyz')
    })
  })
})
