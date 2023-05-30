const syncChanges = require('./sync-changes')

jest.mock('fs')
jest.mock('fs-extra')
jest.mock('browser-sync')

const fs = require('fs')
const fse = require('fs-extra')
const browserSync = require('browser-sync')
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

    syncChanges.flagError(error)

    expect(fse.writeJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.writeJsonSync).toHaveBeenCalledWith(errorsFile, { error })
  })

  it('syncs correctly', () => {
    const port = 1000
    const proxyPort = 900
    const files = ['test-file']

    syncChanges.sync({ port, proxyPort, files })

    const browserSyncParams = browserSync.mock.calls[0][0]

    expect(browserSyncParams).toHaveProperty('port', port)
    expect(browserSyncParams).toHaveProperty('proxy', `localhost:${900}`)
    expect(browserSyncParams).toHaveProperty('port', port)

    jest.spyOn(fs, 'existsSync').mockImplementation(() => {
      return true
    })

    const once = (event, callback) => {
      expect(event).toEqual('browser:reload')
      callback()
    }

    const bs = { events: { once } }

    browserSyncParams.callbacks.ready(null, bs)

    syncChanges.pageLoaded()

    expect(fs.existsSync).toHaveBeenCalledTimes(3)
    expect(fs.existsSync).toHaveBeenCalledWith(errorsFile)

    expect(fs.unlinkSync).toHaveBeenCalledTimes(1)
    expect(fs.unlinkSync).toHaveBeenCalledWith(errorsFile)
  })
})
