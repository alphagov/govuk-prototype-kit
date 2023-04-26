
// core dependencies
const path = require('path')

// npm dependencies
const session = require('express-session')
const FileStore = require('./session-file-store')(session)
const { get: getKeypath } = require('lodash')

// local dependencies
const { getConfig } = require('./config')
const { projectDir, sessionStoreDir } = require('./utils/paths')
const { sessionFileStoreQuietLogFn } = require('./utils')

// Add Nunjucks function called 'checked' to populate radios and checkboxes
function addCheckedFunction (env) {
  env.addGlobal('checked', function (name, value) {
    // Check data exists
    if (this.ctx.data === undefined) {
      return ''
    }

    // Use string keys or object notation to support:
    // checked("field-name")
    // checked("['field-name']")
    // checked("['parent']['field-name']")
    name = !name.match(/[.[]/g) ? `['${name}']` : name
    const storedValue = getKeypath(this.ctx.data, name)

    // Check the requested data exists
    if (storedValue === undefined) {
      return ''
    }

    let checked = ''

    // If data is an array, check it exists in the array
    if (Array.isArray(storedValue)) {
      if (storedValue.indexOf(value) !== -1) {
        checked = 'checked'
      }
    } else {
      // The data is just a simple value, check it matches
      if (storedValue === value) {
        checked = 'checked'
      }
    }
    return checked
  })
}

// Store data from POST body or GET query in session
function storeData (input, data) {
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

function autoStoreData (req, res, next) {
  if (!req.session.data) {
    req.session.data = {}
  }

  req.session.data = Object.assign({}, sessionDataDefaults, req.session.data)

  storeData(req.body, req.session.data)
  storeData(req.query, req.session.data)

  // Send session data to all views

  res.locals.data = {}

  for (const j in req.session.data) {
    res.locals.data[j] = req.session.data[j]
  }

  next()
}

function getSessionNameFromWorkingDirectory (workingDirectory) {
  return 'govuk-prototype-kit-' + (Buffer.from(workingDirectory, 'utf8')).toString('hex')
}

function getSessionMiddleware () {
  const config = getConfig()
  const workingDirectory = process.cwd()

  // Session uses working directory path to avoid clashes with other prototypes
  const sessionName = getSessionNameFromWorkingDirectory(workingDirectory)
  const sessionHours = 4
  const sessionOptions = {
    secret: sessionName,
    cookie: {
      maxAge: 1000 * 60 * 60 * sessionHours,
      secure: config.isSecure
    }
  }

  const fileStoreOptions = {
    path: sessionStoreDir,
    retries: 1
  }

  if (config.isDevelopment) {
    fileStoreOptions.logFn = sessionFileStoreQuietLogFn
  }

  return session(Object.assign(sessionOptions, {
    name: sessionName,
    resave: false,
    saveUninitialized: false,
    store: new FileStore(fileStoreOptions)
  }))
}

module.exports = {
  addCheckedFunction,
  getSessionMiddleware,
  autoStoreData
}
