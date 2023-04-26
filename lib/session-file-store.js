module.exports = (expressSession) => {
  class FileStore extends expressSession.Store {
    constructor (options) {
      super()
      this.options = options
    }

    on (eventId, onEvent) {
      console.log('session event: ' + eventId)
      onEvent()
    }

    set (sessionId, session, callback) {
      const err = null
      if (err) {
        callback(err)
      } else {
        callback(null, session)
      }
    }

    get (sessionId, callback) {
      const err = null
      const session = expressSession
      if (err) {
        callback(err)
      } else {
        callback(null, session)
      }
    }

    createSession (req, session) {
      console.log("we've created a session!")
    }
  }

  return FileStore
}
