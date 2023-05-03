const fse = require('fs-extra')
const path = require('path')
const Store = require('express-session').Store

class FileStore extends Store {
  constructor (options) {
    super()
    this.options = options || {}
    this.path = this.options.path || './sessions'
  }

  async set (sessionId, session, callback) {
    try {
      fse.ensureDir(this.path, { recursive: true })
      const filename = path.join(this.path, sessionId + '.json')
      await fse.writeJson(filename, session)
      callback()
    } catch (err) {
      callback(err)
    }
  }

  async get (sessionId, callback) {
    try {
      const filename = path.join(this.path, sessionId + '.json')
      const session = await fse.readJson(filename)
      callback(null, session)
    } catch (err) {
      if (err.code === 'ENOENT') {
        callback(null, null)
      } else {
        callback(err)
      }
    }
  }

  async destroy (sessionId, callback) {
    try {
      const filename = path.join(this.path, sessionId + '.json')
      await fse.remove(filename)
      callback()
    } catch (err) {
      callback(err)
    }
  }
}

module.exports = FileStore
