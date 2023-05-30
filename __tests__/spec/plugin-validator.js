/* eslint-env jest */

const childProcess = require('node:child_process')
const path = require('path')

function run (path) {
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
    cp.on('exit', (statusCode) => {
      if (statusCode === 0) {
        resolve({
          stdout: stdOutParts.join('\n'),
          stderr: stdErrParts.join('\n'),
          statusCode
        })
      }
    })
  })
}

const fixtureProjectDirectory = path.join(__dirname, '..', 'fixtures', 'mockPlugins', 'valid-plugin')

describe('plugin-validator', () => {
  it('should work', async () => {
    const result = await run(fixtureProjectDirectory)

    expect(result).toEqual({
      stdout: 'Your plugin is valid.',
      stderr: '',
      statusCode: 0
    })
  })
  it('should return list of errors found', async () => {
    const result = await run('../fixtures/mockPlugins/invalid-plugin')

    expect(result).toEqual({
      stdout: '',
      stderr: 'Error in plugin:\n\n- Missing forwardslash on xyz',
      statusCode: 0
    })
  })
})
