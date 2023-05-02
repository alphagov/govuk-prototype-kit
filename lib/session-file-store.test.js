const FileStore = require('./session-file-store')
const fse = require('fs-extra')

jest.mock('fs-extra')

describe('session-file-store', () => {
  let store

  beforeEach(() => {
    store = new FileStore()
  })

  it('should write session to a file', () => {
    const dataToWrite = { sessionId: 1500, data: { name: 'Jon' } }
    const cb = jest.fn()
    fse.ensureDirSync.mockResolvedValue(true)
    fse.writeJsonSync.mockResolvedValue(true)

    store.set(dataToWrite.sessionId, dataToWrite, cb)

    expect(fse.ensureDirSync).toHaveBeenCalledTimes(1)
    expect(fse.ensureDirSync).toHaveBeenCalledWith(store.path, { recursive: true })
    expect(fse.writeJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.writeJsonSync).toHaveBeenCalledWith(`sessions/${dataToWrite.sessionId}.json`, dataToWrite)
  })

  it('should read the session given a file path', () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const expectedFilePath = `sessions/${sessionId}.json`
    fse.readJsonSync.mockResolvedValue('{ sessionId: 1500, data: { name: "Jon" }')

    store.get(sessionId, cb)

    expect(fse.readJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.readJsonSync).toHaveBeenCalledWith(expectedFilePath)
  })

  it('should call callback function with null arguments if ENOENT error occurs when getting session', () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const expectedError = new Error()
    expectedError.code = 'ENOENT'

    fse.readJsonSync.mockImplementation(() => {
      throw expectedError
    })

    store.get(sessionId, cb)

    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(null, null)
  })

  it('should call callback function with error argument if other error occurs when getting session', () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const expectedError = new Error()
    expectedError.code = 'ENOTFOUND'

    fse.readJsonSync.mockImplementation(() => {
      throw expectedError
    })

    store.get(sessionId, cb)

    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(expectedError)
  })

  it('should call callback function if error occurs when setting session', () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const dataToWrite = { data: { name: 'test123' } }
    const expectedError = new Error()
    expectedError.code = 'ENOTFOUND'

    fse.writeJsonSync.mockImplementation(() => {
      throw expectedError
    })

    store.set(sessionId, dataToWrite, cb)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(expectedError)
  })
})
