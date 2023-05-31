/* eslint-env jest */

const childProcess = require('node:child_process')
const path = require('path')

async function run (pathToPlugin) {
  const stdOutParts = []
  const stdErrParts = []
  return new Promise((resolve, reject) => {
    const cp = childProcess.spawn('./bin/cli', ['validate-plugin', path], {
      env: {
        ...process.env
      }
    })

    cp.stdout.on('data', (data) => {
      stdOutParts.push(data.toString())
    })
    cp.stderr.on('data', (data) => {
      stdErrParts.push(data.toString())
    })
    cp.on('exit', (statusCode) => resolve({
        stdout: stdOutParts.join('\n'),
        stderr: stdErrParts.join('\n'),
        statusCode
      })
    )
  })
}

describe('plugin-validator', () => {
  it('should work', () => {
    const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'valid-plugin')
    return run(fixtureProjectDirectory)
      .then((result) => {
        expect(result).toEqual({
          stdout: 'Your plugin is valid.',
          stderr: '',
          statusCode: 0
        })
      })
      .catch((err) => {
        console.log(err)
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
