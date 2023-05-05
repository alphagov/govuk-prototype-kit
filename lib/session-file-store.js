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
      if (!isExpired(session)) {
        fse.ensureDirSync(this.path, { recursive: true })
        const filename = path.join(this.path, sessionId + '.json')
        await fse.writeJson(filename, session)
        callback()
      } else {
        this.destroy(session, callback)
      }
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

function isExpired (session) {
  if (session && session.cookie && session.cookie.expires) {
    const expiryDate = new Date(session.cookie.expires)
    if (expiryDate < Date.now()) {
      return true
    }
  }
}

module.exports = FileStore
