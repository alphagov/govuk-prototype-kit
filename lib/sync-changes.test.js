const syncChanges = require('./sync-changes')

jest.mock('fs')
jest.mock('fs-extra')
jest.mock('@11ty/eleventy-dev-server', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((name, dir, options) => ({
    options,
    serve: jest.fn(),
    reload: jest.fn(),
    ready: jest.fn(async () => {}),
    updateServer: {
      once: jest.fn((event, callback) => {
        expect(event).toEqual('connection')
        callback()
      })
    }
  }))
}))

const fs = require('fs')
const fse = require('fs-extra')
const EleventyDevServer = require('@11ty/eleventy-dev-server').default
const path = require('path')
const { tmpDir } = require('./utils/paths')

const errorsFile = path.join(tmpDir, 'errors.json')

describe('sync-changes', () => {
  beforeEach(() => {
    //
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('flags error correctly', () => {
    const error = { data: true }
    const errorFormatted = '{\n  data: true\n}'

    syncChanges.flagError(error)

    expect(fse.writeJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.writeJsonSync).toHaveBeenCalledWith(errorsFile, { error: errorFormatted })
  })

  it('syncs correctly', async () => {
    const port = 1000
    const proxyPort = 900
    const files = ['test-file']

    jest.spyOn(fs, 'existsSync').mockImplementation(() => {
      return true
    })

    await syncChanges.sync({ port, proxyPort, files })

    const [name, , devServerParams] = EleventyDevServer.mock.calls[0]
    const server = EleventyDevServer.mock.results[0].value

    expect(name).toEqual('govuk-prototype-kit')
    expect(devServerParams).toHaveProperty('port', port)
    expect(devServerParams).toHaveProperty('watch', files)

    expect(server.serve).toHaveBeenCalledWith(port)

    syncChanges.pageLoaded()

    expect(fs.existsSync).toHaveBeenCalledTimes(4)
    expect(fs.existsSync).toHaveBeenCalledWith(errorsFile)

    expect(fs.unlinkSync).toHaveBeenCalledTimes(1)
    expect(fs.unlinkSync).toHaveBeenCalledWith(errorsFile)
  })
})
