/* eslint-env jest */

describe('sanitisePaths', () => {
  const os = require('os')
  const path = require('path')

  const { sanitisePaths } = require('./logger')

  it('replaces occurences of home directory with ~', () => {
    expect(
      sanitisePaths(path.join(os.homedir(), 'path', 'to', 'folder'))
    ).toEqual(path.join('~', 'path', 'to', 'folder'))
  })

  it('replaces all occurences in a string', () => {
    expect(
      sanitisePaths(process.argv.join(' '))
    ).not.toContain(os.homedir())
  })
})
