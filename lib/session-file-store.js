const fse = require('fs-extra')
const path = require('path')
const Store = require('express-session').Store

class FileStore extends Store {
  constructor (options) {
    super()
    this.options = options || {}
    this.path = this.options.path || './sessions'
  }

  set (sessionId, session, callback) {
    try {
      fse.ensureDirSync(this.path, { recursive: true })
      const filename = path.join(this.path, sessionId + '.json')
      fse.writeJsonSync(filename, session)
      callback()
    } catch (err) {
      callback(err)
    }
  }

  get (sessionId, callback) {
    try {
      const filename = path.join(this.path, sessionId + '.json')
      const session = fse.readJsonSync(filename)
      callback(null, session)
    } catch (err) {
      if (err.code === 'ENOENT') {
        callback(null, null)
      } else {
        callback(err)
      }
    }
  }

  destroy (sessionId, callback) {
    try {
      const filename = path.join(this.path, sessionId + '.json')
      const session = fse.removeSync(filename)
      callback(null, session)
    } catch (err) {
      callback(err)
    }
  }
}

module.exports = FileStore
