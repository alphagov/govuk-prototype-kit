const fse = require('fs-extra')
const path = require('path')
const FileStore = require('./session-file-store')

jest.mock('fs-extra')

describe('FileStore', () => {
  let store

  beforeEach(() => {
    store = new FileStore()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('get', () => {
    it('should call fse.readJson with the correct file path', async () => {
      const sid = 'abc123'
      const callback = jest.fn()
      const expectedFile = path.join(store.path, `${sid}.json`)
      const expectedSession = { user: 'testuser' }
      fse.readJson.mockResolvedValue(expectedSession)

      await store.get(sid, callback)

      expect(fse.readJson).toHaveBeenCalledWith(expectedFile)
      expect(callback).toHaveBeenCalledWith(null, expectedSession)
    })

    it('should call callback with null if the file does not exist', async () => {
      const sid = 'abc123'
      const callback = jest.fn()
      const expectedFile = path.join(store.path, `${sid}.json`)
      const expectedError = { code: 'ENOENT' }
      fse.readJson.mockRejectedValue(expectedError)

      await store.get(sid, callback)

      expect(fse.readJson).toHaveBeenCalledWith(expectedFile)
      expect(callback).toHaveBeenCalledWith(null, null)
    })

    it('should call callback with an error if an error occurs', async () => {
      const sid = 'abc123'
      const callback = jest.fn()
      const expectedFile = path.join(store.path, `${sid}.json`)
      const expectedError = new Error('File not found')
      fse.readJson.mockRejectedValue(expectedError)

      await store.get(sid, callback)

      expect(fse.readJson).toHaveBeenCalledWith(expectedFile)
      expect(callback).toHaveBeenCalledWith(expectedError)
    })
  })

  describe('set', () => {
    it('should call fse.writeJson with the correct file path and session', async () => {
      const sid = 'abc123'
      const session = { user: 'testuser' }
      const callback = jest.fn()
      const expectedFile = path.join(store.path, `${sid}.json`)
      fse.writeJson.mockResolvedValue(session)

      await store.set(sid, session, callback)

      expect(fse.ensureDir).toHaveBeenCalledWith(store.path, { recursive: true })
      expect(fse.writeJson).toHaveBeenCalledWith(expectedFile, session)
      expect(callback).toHaveBeenCalledWith(null, session)
    })

    it('should call callback with an error if an error occurs', async () => {
      const sid = 'abc123'
      const session = { user: 'testuser' }
      const callback = jest.fn()
      const expectedFile = path.join(store.path, `${sid}.json`)
      const expectedError = new Error('File system error')
      fse.writeJson.mockRejectedValue(expectedError)

      await store.set(sid, session, callback)

      expect(fse.ensureDir).toHaveBeenCalledWith(store.path, { recursive: true })
      expect(fse.writeJson).toHaveBeenCalledWith(expectedFile, session)
      expect(callback).toHaveBeenCalledWith(expectedError)
    })
  })

  describe('destroy', () => {
    it('should call fse.unlink with the correct file path', async () => {
      const sid = 'abc123'
      const callback = jest.fn()
      const expectedFile = path.join(store.path, `${sid}.json`)

      await store.destroy(sid, callback)

      expect(fse.unlink).toHaveBeenCalledWith(expectedFile)
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('length', () => {
    it('should call fse.readdir with the correct path and return the number of files', async () => {
      const callback = jest.fn()
      const expectedFiles = ['abc123.json', 'def456.json', 'ghi789.json']
      fse.readdir.mockResolvedValue(expectedFiles)

      await store.length(callback)

      expect(fse.readdir).toHaveBeenCalledWith(store.path)
      expect(callback).toHaveBeenCalledWith(null, expectedFiles.length)
    })

    it('should call callback with an error if an error occurs', async () => {
      const callback = jest.fn()
      const expectedError = new Error('File system error')
      fse.readdir.mockRejectedValue(expectedError)

      await store.length(callback)

      expect(fse.readdir).toHaveBeenCalledWith(store.path)
      expect(callback).toHaveBeenCalledWith(expectedError)
    })
  })

  describe('clear', () => {
    it('should call fse.emptyDir with the correct path', async () => {
      const callback = jest.fn()

      await store.clear(callback)

      expect(fse.emptyDir).toHaveBeenCalledWith(store.path)
      expect(callback).toHaveBeenCalled()
    })

    it('should call callback with an error if an error occurs', async () => {
      const callback = jest.fn()
      const expectedError = new Error('File system error')
      fse.emptyDir.mockRejectedValue(expectedError)

      await store.clear(callback)

      expect(fse.emptyDir).toHaveBeenCalledWith(store.path)
      expect(callback).toHaveBeenCalledWith(expectedError)
    })
  })
})
