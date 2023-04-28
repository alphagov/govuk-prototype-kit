const FileStore = require('./session-file-store')
const fse = require('fs-extra')
const path = require('path')

jest.mock('fs-extra', () => {
  return {
    ensureDirSync: jest.fn().mockResolvedValue(true),
    writeJsonSync: jest.fn().mockResolvedValue(true),
    readJsonSync: jest.fn().mockResolvedValue('{ sessionId: 1500, data: { name: "Jon" }')
  }
})

describe('session-file-store', () => {
  let store

  beforeEach(() => {
    store = new FileStore()
  })

  it('should write session to a file', () => {
    const dataToWrite = { sessionId: 1500, data: { name: 'Jon' }}
    const sessionId = 'testSession123'
    const cb = jest.fn()
    store.set(dataToWrite.sessionId, dataToWrite, cb)

    expect(fse.ensureDirSync).toHaveBeenCalledTimes(1)
    expect(fse.ensureDirSync).toHaveBeenCalledWith(store.path, { recursive: true })
    expect(fse.writeJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.writeJsonSync).toHaveBeenCalledWith(`${sessionId}.json`, dataToWrite)
  })

  it('should read the session given a file path', () => {
    const sessionId = 'testSession123'
    const cb = jest.fn()
    const expectedFilePath = path.join(store.path, `${sessionId}.json`)
    store.get(sessionId, cb)

    expect(fse.readJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.readJsonSync).toHaveBeenCalledWith(expectedFilePath)
  })

  it('should call callback function with null arguments if ENOENT error occurs', () => {
    const sessionId = 'testSession123'
    const cb = jest.fn()
    const expectedFilePath = path.join(store.path, `${sessionId}.json`)
    const expectedError = { code: 'ENOENT' }

    fse.readJsonSync.mockRejectedValue(expectedError)

    store.get(sessionId, cb)

    expect(fse.readJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.readJsonSync).toHaveBeenCalledWith(expectedFilePath)
    expect(cb).toHaveBeenCalledTimes(2)
    expect(cb).toHaveBeenCalledWith(null, null)
  })

  it('should call callback function with error argument if other error occurs', () => {
  })

  it('should call callback function if error occurs', () => {
  })
})
