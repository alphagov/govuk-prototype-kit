/* eslint-env jest */

const path = require('path')

const cliPath = path.join(__dirname, '..', '..', 'bin', 'cli')
const { exec } = require('child_process')

async function runShellCommand (fixtureProjectDirectory, cb) {
  await exec(`"${process.execPath}" ${cliPath} validate-plugin ${fixtureProjectDirectory}`,
    { cwd: fixtureProjectDirectory, env: process.env, stdio: 'inherit' }, function (err, stdout, stderr) {
      if (err) {
        cb(stderr)
      } else {
        cb(JSON.stringify(stdout))
      }
    })
}

describe('plugin-validator', () => {
  it('should work', () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'valid-plugin')
    runShellCommand(fixtureProjectDirectory, function (result) {
      // handle errors here
      console.log(result)
    })
  })
  it('should return list of errors found', async () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'invalid-plugin')

    return run(fixtureProjectDirectory)
      .then((result) => {
        expect(result).toEqual({
          stdout: 'Error in plugin:\n\n- Missing forwardslash on xyz',
          stderr: '',
          statusCode: 0
        })
      })
      .catch((err) => {
        console.log(err)
      })
  })
})
