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
  
    //
    // get () {
    //   console.log('getting: ' + JSON.stringify({ data: this.data }, null, 2))
    //   return this.data
    // }
  }
  
  module.exports = (session) => {
    return FileStore
  }