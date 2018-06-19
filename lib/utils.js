// Core dependencies
const fs = require('fs')

// NPM dependencies
const basicAuth = require('basic-auth')
const marked = require('marked')
const path = require('path')
const portScanner = require('portscanner')
const prompt = require('prompt')
const request = require('sync-request')

// Local dependencies
const config = require('../app/config.js')

// Variables
var releaseUrl = null

// Require core and custom filters, merges to one object
// and then add the methods to Nunjucks environment
exports.addNunjucksFilters = function (env) {
  var coreFilters = require('./core_filters.js')(env)
  var customFilters = require('../app/filters.js')(env)
  var filters = Object.assign(coreFilters, customFilters)
  Object.keys(filters).forEach(function (filterName) {
    env.addFilter(filterName, filters[filterName])
  })
}

// Add Nunjucks function called 'checked' to populate radios and checkboxes
exports.addCheckedFunction = function (env) {
  env.addGlobal('checked', function (name, value) {
    // Check data exists
    if (this.ctx.data === undefined) {
      return ''
    }

    var storedValue = this.ctx.data[name]

    // Check the requested data exists
    if (storedValue === undefined) {
      return ''
    }

    var checked = ''

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

/**
 * Simple basic auth middleware for use with Express 4.x.
 *
 * Based on template found at: http://www.danielstjules.com/2014/08/03/basic-auth-with-express-4/
 *
 * @example
 * app.use('/api-requiring-auth', utils.basicAuth('username', 'password'))
 *
 * @param   {string}   username Expected username
 * @param   {string}   password Expected password
 * @returns {function} Express 4 middleware requiring the given credentials
 */

exports.basicAuth = function (username, password) {
  return function (req, res, next) {
    if (!username || !password) {
      console.log('Username or password is not set.')
      return res.send('<h1>Error:</h1><p>Username or password not set. <a href="https://govuk-prototype-kit.herokuapp.com/docs/publishing-on-heroku#5-set-a-username-and-password">See guidance for setting these</a>.</p>')
    }

    var user = basicAuth(req)

    if (!user || user.name !== username || user.pass !== password) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required')
      return res.sendStatus(401)
    }

    next()
  }
}

// Find an available port to run the server on
exports.findAvailablePort = function (app, callback) {
  var port = null

  // When the server starts, we store the port in .port.tmp so it tries to restart
  // on the same port
  try {
    port = Number(fs.readFileSync(path.join(__dirname, '/../.port.tmp')))
  } catch (e) {
    port = Number(process.env.PORT || config.port)
  }

  console.log('')

  // Check port is free, else offer to change
  portScanner.findAPortNotInUse(port, port + 50, '127.0.0.1', function (error, availablePort) {
    if (error) { throw error }
    if (port === availablePort) {
      // Port is free, return it via the callback
      callback(port)
    } else {
      // Port in use - offer to change to available port
      console.error('ERROR: Port ' + port + ' in use - you may have another prototype running.\n')
      // Set up prompt settings
      prompt.colors = false
      prompt.start()
      prompt.message = ''
      prompt.delimiter = ''

      // Ask user if they want to change port
      prompt.get([{
        name: 'answer',
        description: 'Change to an available port? (y/n)',
        required: true,
        type: 'string',
        pattern: /y(es)?|no?/i,
        message: 'Please enter y or n'
      }], function (err, result) {
        if (err) { throw err }
        if (result.answer.match(/y(es)?/i)) {
          // User answers yes
          port = availablePort
          fs.writeFileSync(path.join(__dirname, '/../.port.tmp'), port)
          console.log('Changed to port ' + port)

          callback(port)
        } else {
          // User answers no - exit
          console.log('\nYou can set a new default port in server.js, or by running the server with PORT=XXXX')
          console.log("\nExit by pressing 'ctrl + c'")
          process.exit(0)
        }
      })
    }
  })
}

// Redirect HTTP requests to HTTPS
exports.forceHttps = function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    console.log('Redirecting request to https')
    // 302 temporary - this is a feature that can be disabled
    return res.redirect(302, 'https://' + req.get('Host') + req.url)
  }
  next()
}

// Synchronously get the URL for the latest release on GitHub and cache it
exports.getLatestRelease = function () {
  var url = ''

  if (releaseUrl !== null) {
    // Release URL already exists
    console.log('Release url cached:', releaseUrl)
    return releaseUrl
  } else {
    // Release URL doesn't exist
    var options = {
      headers: {'user-agent': 'node.js'}
    }
    var gitHubUrl = 'https://api.github.com/repos/alphagov/govuk-prototype-kit-private-beta/releases/latest'
    try {
      console.log('Getting latest release from GitHub')

      var res = request('GET', gitHubUrl, options)
      var data = JSON.parse(res.getBody('utf8'))
      var zipballUrl = data['zipball_url']
      var releaseVersion = zipballUrl.split('/').pop()
      var urlStart = 'https://github.com/alphagov/govuk-prototype-kit-private-beta/archive/'
      var urlEnd = '.zip'
      var zipUrl = urlStart + releaseVersion + urlEnd

      console.log('Release URL is', zipUrl)
      releaseUrl = zipUrl
      url = releaseUrl
    } catch (err) {
      url = 'https://github.com/alphagov/govuk-prototype-kit-private-beta/releases/latest'
      console.log("Couldn't retrieve release URL")
    }
  }
  return url
}

// Try to match a request to a template, for example a request for /test
// would look for /app/views/test.html
// or /app/views/text/index.html
exports.matchRoutes = function (req, res) {
  var path = (req.params[0])
  res.render(path, function (err, html) {
    if (err) {
      res.render(path + '/index', function (err2, html) {
        if (err2) {
          res.status(404).send(err + '<br>' + err2)
        } else {
          res.end(html)
        }
      })
    } else {
      res.end(html)
    }
  })
}

// Try to match a request to a Markdown file and render it
exports.matchMdRoutes = function (req, res) {
  var docsPath = '/../docs/documentation/'
  if (fs.existsSync(path.join(__dirname, docsPath, req.params[0] + '.md'), 'utf8')) {
    var doc = fs.readFileSync(path.join(__dirname, docsPath, req.params[0] + '.md'), 'utf8')
    res.render('documentation_template', {'document': this.markdownToHtml(doc)})
    return true
  }
  return false
}

// Store data from POST body or GET query in session
var storeData = function (input, store) {
  for (var i in input) {
    // any input where the name starts with _ is ignored
    if (i.indexOf('_') === 0) {
      continue
    }

    var val = input[i]

    // Delete values when users unselect checkboxes
    if (val === '_unchecked' || val === ['_unchecked']) {
      delete store.data[i]
      continue
    }

    // Remove _unchecked from arrays of checkboxes
    if (Array.isArray(val)) {
      var index = val.indexOf('_unchecked')
      if (index !== -1) {
        val.splice(index, 1)
      }
    }

    store.data[i] = val
  }
}

// Middleware - store any data sent in session, and pass it to all views
exports.autoStoreData = function (req, res, next) {
  if (!req.session.data) {
    req.session.data = {}
  }

  storeData(req.body, req.session)
  storeData(req.query, req.session)

  // Send session data to all views

  res.locals.data = {}

  for (var j in req.session.data) {
    res.locals.data[j] = req.session.data[j]
  }

  next()
}

// convert markdown to HTML
exports.markdownToHtml = function (document) {
  var hljs = require('highlight.js')
  var renderer = new marked.Renderer()

  // add highlight classes to code block
  renderer.code = function (code, language) {
    language = language || 'bash'
    return '<pre><code class="hljs ' + language + '">' +
      hljs.highlight(language, code).value +
      '</code></pre>'
  }
  return marked(document, { renderer: renderer })
}
