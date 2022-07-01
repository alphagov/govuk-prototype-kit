/* eslint-env jest */

const path = require('path')

const createReleaseArchive = require('./index')

const mockCreateReleaseArchive = jest.fn()
createReleaseArchive.createReleaseArchive = mockCreateReleaseArchive

const cli = require('./cli')

const repoDir = path.join(__dirname, '..', '..')

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

    mockCreateReleaseArchive.mockImplementation(() => 'qux.foo')
    cli.cli()

    expect(mockCreateReleaseArchive).toHaveBeenCalledWith(
      'foo', 'bar', 'baz', 'qux', expect.anything()
    )
  })

  it('defaults to creating a release of HEAD in the repo dir', () => {
    process.argv = [
      null, null
    ]

    mockCreateReleaseArchive.mockImplementation(() => 'qux.foo')
    cli.cli()

    expect(mockCreateReleaseArchive).toHaveBeenCalledWith(
      'zip', repoDir, expect.anything(), 'HEAD', expect.anything()
    )
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

    expect(mockCreateReleaseArchive).not.toHaveBeenCalled()
    expect(process.exitCode).not.toBe(0)
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringMatching(/^Usage:.*/m)
    )
  })
})
