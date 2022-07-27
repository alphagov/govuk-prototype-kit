/* eslint-env jest */

const path = require('path')

jest.mock('./index')
const { createReleaseArchiveSync: mockCreateReleaseArchiveSync } = require('./index')

const cli = require('./cli')

const repoDir = path.join(__dirname, '..', '..')

function testFailingIf (condition, ...args) {
  if (condition) {
    return test.failing(...args)
  } else {
    return test(...args)
  }
}

describe('create-release-archive/cli', () => {
  let actualArgv

  beforeEach(() => {
    actualArgv = process.argv
  })

  afterEach(() => {
    process.argv = actualArgv
    jest.resetAllMocks()
  })

  it('parses command line arguments', () => {
    process.argv = [
      null, null,
      '--archiveType', 'foo',
      '--destDir', 'bar',
      '--releaseName', 'baz',
      'qux'
    ]

    mockCreateReleaseArchiveSync.mockImplementation(() => 'qux.foo')
    cli.cli()

    expect(mockCreateReleaseArchiveSync).toHaveBeenCalledWith(expect.objectContaining({
      archiveType: 'foo', destDir: 'bar', releaseName: 'baz', ref: 'qux'
    }))
  })

  // this fails on CI because we do a shallow clone
  testFailingIf(process.env.CI, 'defaults to creating a release of HEAD in the repo dir', () => {
    process.argv = [
      null, null
    ]

    mockCreateReleaseArchiveSync.mockImplementation(() => 'qux.foo')
    cli.cli()

    expect(mockCreateReleaseArchiveSync).toHaveBeenCalledWith(expect.objectContaining({
      archiveType: 'zip',
      destDir: repoDir,
      releaseName: expect.anything(),
      ref: 'HEAD'
    }))
  })

  it('prints an error and exits if it does not recognise the arguments', () => {
    process.argv = [
      null, null,
      '--foo', 'bar'
    ]

    const actualConsoleLog = global.console.log
    const mockConsoleLog = jest.fn()
    global.console.log = mockConsoleLog

    cli.cli()

    global.console.log = actualConsoleLog

    expect(mockCreateReleaseArchiveSync).not.toHaveBeenCalled()
    expect(process.exitCode).not.toBe(0)
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringMatching(/^Usage:.*/m)
    )
  })
})
