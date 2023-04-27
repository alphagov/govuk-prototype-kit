const fse = require('fs-extra')
const path = require('path')

module.exports = ({ Store }) => {
  class FileStore extends Store {
    constructor (options) {
      super(options)
      Object.assign(this, options)
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
        callback(err)
      }
    }

    createSession (req, session) {
      if (req.sessionId) {
        fse.ensureDirSync(this.path, { recursive: true })
        const filename = path.join(this.path, req.sessionId + '.json')
        fse.writeJsonSync(filename, session)
      }
      super.createSession(req, session)
    }
  }

  return FileStore
}
