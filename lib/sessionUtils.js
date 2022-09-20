const { getConfig } = require('./config')
const sessionInCookie = require('client-sessions')
const sessionInMemory = require('express-session')
const path = require('path')
const filters = require('../index').views
const { projectDir } = require('./path-utils')
const { get: getKeypath } = require('lodash')

const storeData = function (input, data) {
  for (const i in input) {
    // any input where the name starts with _ is ignored
    if (i.indexOf('_') === 0) {
      continue
    }

    let val = input[i]

    // Delete values when users unselect checkboxes
    if (val === '_unchecked' || val === ['_unchecked']) {
      delete data[i]
      continue
    }

    // Remove _unchecked from arrays of checkboxes
    if (Array.isArray(val)) {
      val = val.filter((item) => item !== '_unchecked')
    } else if (typeof val === 'object') {
      // Store nested objects that aren't arrays
      if (typeof data[i] !== 'object') {
        data[i] = {}
      }

      // Add nested values
      storeData(val, data[i])
      continue
    }

    data[i] = val
  }
}

// Get session default data from file

let sessionDataDefaults

const sessionDataDefaultsFile = path.join(projectDir, 'app', 'data', 'session-data-defaults.js')

try {
  sessionDataDefaults = require(sessionDataDefaultsFile)
} catch (e) {
  sessionDataDefaults = {}
}
// Middleware - store any data sent in session, and pass it to all views

const autoStoreData = function (req, res, next) {
  if (!req.session.data) {
    req.session.data = {}
  }

  req.session.data = Object.assign({}, sessionDataDefaults, req.session.data)

  storeData(req.body, req.session.data)
  storeData(req.query, req.session.data)

  // Send session data to all views

  res.locals.data = {}

  for (var j in req.session.data) {
    res.locals.data[j] = req.session.data[j]
  }

  next()
}

const getSessionNameFromServiceName = (serviceName) => {
  return 'govuk-prototype-kit-' + (Buffer.from(serviceName, 'utf8')).toString('hex')
}

const getSessionMiddleware = () => {
  // Session uses service name to avoid clashes with other prototypes
  const sessionName = getSessionNameFromServiceName(getConfig().serviceName)
  const sessionHours = 4
  const sessionOptions = {
    secret: sessionName,
    cookie: {
      maxAge: 1000 * 60 * 60 * sessionHours,
      secure: getConfig().isSecure
    }
  }

  // Support session data in cookie or memory
  if (getConfig().useCookieSessionStore) {
    return sessionInCookie(Object.assign(sessionOptions, {
      cookieName: sessionName,
      proxy: true,
      requestKey: 'session'
    }))
  } else {
    return sessionInMemory(Object.assign(sessionOptions, {
      name: sessionName,
      resave: false,
      saveUninitialized: false
    }))
  }
}

module.exports = {
  getSessionMiddleware,
  autoStoreData,
  hello: 'world'
}
