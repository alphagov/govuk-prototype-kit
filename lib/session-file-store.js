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
      // Delete any expired sessions before creating a new session
      const storedSessions = fse.readdirSync(this.path)
      storedSessions.forEach(session => {
        const storedSession = fse.readJsonSync(path.join(this.path, session))
        if (isExpired(storedSession)) {
          console.log('destroy is being called')
          this.destroy(session.sessionId, callback)
        }
      })
    } catch (err) {
      if (err.code !== 'ENOENT') {
        callback(err)
      }
    }

    // Now create/update the session
    try {
      fse.ensureDirSync(this.path, { recursive: true })
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
      console.log(`destroying session: ${sessionId}`)
      callback()
    } catch (err) {
      callback(err)
    }
  }
}

function isExpired (session) {
  if (session && session.cookie && session.cookie.expires) {
    const expiryDate = new Date(session.cookie.expires)
    console.log(`diff (${session.sessionId}) = ${expiryDate.valueOf() - Date.now()} ms`)
    if (expiryDate.valueOf() < Date.now()) {
      return true
    }
  }
}

module.exports = FileStore
