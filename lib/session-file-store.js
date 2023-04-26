class FileStore {
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
        if (err) {
          callback(err)
        } else {
          callback(null, session)
        }
    }
  }
  
  module.exports = (session) => {
    return FileStore
  }