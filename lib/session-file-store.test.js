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
    const cb = jest.fn()
    store.set(dataToWrite.sessionId, dataToWrite, cb)

    expect(fse.ensureDirSync).toHaveBeenCalledTimes(1)
    expect(fse.writeJsonSync).toHaveBeenCalledTimes(1)
  })

  it('should read the session given a file name', () => {
    const sessionToRead = { sessionId: 1500 }
    const cb = jest.fn()
    store.get(sessionToRead.sessionId, cb)

    expect(fse.readJsonSync).toHaveBeenCalledTimes(1)
  })

  it('should call callback function with null arguments if ENOENT error occurs', () => {
  })

  it('should call callback function with error argument if other error occurs', () => {
  })

  it('should call callback function if error occurs', () => {
  })
})
