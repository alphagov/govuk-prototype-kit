/**
 * Provide default values for the user session. These are automatically added
 * via the `autoStoreData` middleware. These values will only be added to the
 * session, if a value doesn't already exist.
 * @type {Object}
 */
module.exports = {
  // string: 'I am a string, which will be stored in the session. I can be accessed via req.session.data["string"]',
  // array: ['I', 'am', 'an', 'array', 'of', 'values', 'in', 'the', 'session', 'data'],
  /*
    object: {
      i: {
        am: 'an object'
      },
      a: {
        nested: ['array', 'of', 'values']
      }
    }
  */
}
