const fse = require('fs-extra')
const path = require('path')
const Store = require('express-session').Store

class FileStore extends Store {
  constructor (options) {
    super()
    this.options = options || {}
    this.path = this.options.path || './sessions'
  }

  async get (sid, callback) {
    try {
      const file = path.join(this.path, sid + '.json')
      const session = await fse.readJson(file)
      callback(null, session)
    } catch (err) {
      if (err.code === 'ENOENT') {
        callback(null, null)
      } else {
        callback(err)
      }
    }
  }

  async set (sid, session, callback) {
    try {
      await fse.ensureDir(this.path, { recursive: true })
      const file = path.join(this.path, sid + '.json')
      await fse.writeJson(file, session)
      callback(null, session)
    } catch (err) {
      callback(err)
    }
  }

  async destroy (sid, callback) {
    const file = path.join(this.path, sid + '.json')
    await fse.unlink(file)
    callback && callback()
  }

  async length (callback) {
    try {
      const files = await fse.readdir(this.path)
      callback(null, files.length)
    } catch (err) {
      callback(err)
    }
  }

  async clear (callback) {
    try {
      await fse.emptyDir(this.path)
      callback()
    } catch (err) {
      callback(err)
    }
  }
}

module.exports = FileStore
