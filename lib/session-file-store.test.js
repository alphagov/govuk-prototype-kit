const FileStore = require('./session-file-store')
const fse = require('fs-extra')
const path = require('path')

jest.mock('fs-extra')

describe('session-file-store', () => {
  let store

  beforeEach(() => {
    store = new FileStore()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should write session to a file', async () => {
    const dataToWrite = { sessionId: 1500, data: { name: 'Jon' } }
    const cb = jest.fn()
    const expectedFilePath = path.join(store.path, `${dataToWrite.sessionId}.json`)
    fse.ensureDir.mockResolvedValue(true)
    fse.writeJson.mockResolvedValue(true)

    await store.set(dataToWrite.sessionId, dataToWrite, cb)

    expect(fse.ensureDir).toHaveBeenCalledTimes(1)
    expect(fse.ensureDir).toHaveBeenCalledWith(store.path, { recursive: true })
    expect(fse.writeJson).toHaveBeenCalledTimes(1)
    expect(fse.writeJson).toHaveBeenCalledWith(expectedFilePath, dataToWrite)
  })

  it('should read the session given a file path', async () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const expectedFilePath = path.join(store.path, `${sessionId}.json`)
    fse.readJson.mockResolvedValue('{ sessionId: 1500, data: { name: "Jon" }')

    await store.get(sessionId, cb)

    expect(fse.readJson).toHaveBeenCalledTimes(1)
    expect(fse.readJson).toHaveBeenCalledWith(expectedFilePath)
  })

  it('should call callback function with null arguments if ENOENT error occurs when getting session', async () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const expectedError = new Error()
    expectedError.code = 'ENOENT'

    fse.readJson.mockImplementation(() => {
      throw expectedError
    })

    await store.get(sessionId, cb)

    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(null, null)
  })

  it('should call callback function with error argument if other error occurs when getting session', async () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const expectedError = new Error()
    expectedError.code = 'ENOTFOUND'

    fse.readJson.mockImplementation(() => {
      throw expectedError
    })

    await store.get(sessionId, cb)

    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(expectedError)
  })

  it('should call callback function if error occurs when setting session', async () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const dataToWrite = { data: { name: 'test123' } }
    const expectedError = new Error()
    expectedError.code = 'ENOTFOUND'

    fse.readdir.mockResolvedValue([])
    fse.writeJson.mockImplementation(() => {
      throw expectedError
    })

    await store.set(sessionId, dataToWrite, cb)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(expectedError)
  })

  it('should destroy session when called', async () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const expectedFilePath = path.join(store.path, `${sessionId}.json`)
    fse.remove.mockResolvedValue(true)

    await store.destroy(sessionId, cb)

    expect(fse.remove).toHaveBeenCalledTimes(1)
    expect(fse.remove).toHaveBeenCalledWith(expectedFilePath)
    expect(cb).toHaveBeenCalledTimes(1)
  })
})
