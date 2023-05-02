const FileStore = require('./session-file-store')
const fse = require('fs-extra')
const path = require('path')

jest.mock('fs-extra', () => {
  return {
    ensureDirSync: jest.fn().mockResolvedValue(true),
    writeJsonSync: jest.fn().mockResolvedValue(true),
    readJsonSync: jest.fn().mockResolvedValue('{ sessionId: 1500, data: { name: "Jon" }'),
    readJsonSync: jest.fn().mockResolvedValue(`{code: 'ENOENT'}`),
  }
})

describe('session-file-store', () => {
  let store

  beforeEach(() => {
    store = new FileStore()
  })

  it('should write session to a file', () => {
    const dataToWrite = { sessionId: 1500, data: { name: 'Jon' }}
    const cb = jest.fn()
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
    store.get(sessionId, cb)

    expect(fse.readJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.readJsonSync).toHaveBeenCalledWith(expectedFilePath)
  })

  it('should call callback function with null arguments if ENOENT error occurs when getting session', () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const expectedFilePath = `sessions/${sessionId}.json`
    const expectedError = { code: 'ENOENT' }

    fse.readJsonSync.mockRejectedValue(expectedError)
    store.get(sessionId, cb)

    expect(fse.readJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.readJsonSync).toHaveBeenCalledWith(expectedFilePath)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(null, null)
  })

  it('should call callback function with error argument if other error occurs when getting session', () => {
    const sessionId = '1500'
    const cb = jest.fn()
    const expectedFilePath = `sessions/${sessionId}.json`
    const expectedError = { code: 'OTHER ERROR' }

    fse.readJsonSync.mockRejectedValue(expectedError)
    store.get(sessionId, cb)

    expect(fse.readJsonSync).toHaveBeenCalledTimes(1)
    expect(fse.readJsonSync).toHaveBeenCalledWith(expectedFilePath)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(expectedError)
  })

  it('should call callback function if error occurs when setting session', () => {
  })
})
