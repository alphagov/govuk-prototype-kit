
// core dependencies
const url = require('url')

// local dependencies
const config = require('./config')
const { encryptPassword } = require('./utils')

// Local variables
const allowedPathsWhenUnauthenticated = [
  '/manage-prototype/password',
  '/public/stylesheets/unbranded.css',
  '/plugin-assets/govuk-prototype-kit/lib/assets/images/unbranded.ico',
  '/plugin-assets/govuk-frontend/govuk/all.js',
  // Keep /extension-assets path for backwards compatibility
  // TODO: remove in v14
  '/extension-assets/govuk-prototype-kit/lib/assets/images/unbranded.ico',
  '/extension-assets/govuk-frontend/govuk/all.js']

function authentication () {
  const { passwords = [] } = config.getConfig() || {}

  if (!shouldUseAuth()) {
    // do nothing
    return (req, res, next) => {
      next()
    }
  }

  if (!passwords.length) {
    // show errors
    return (req, res) => {
      showNoPasswordError(res)
    }
  }

  // password is encrypted because we store it in a cookie
  // we store the password to compare in case it is changed server-side
  // changing the password should require users to re-authenticate

  return (req, res, next) => {
    if (allowedPathsWhenUnauthenticated.includes(req.path)) {
      next()
    } else if (passwords.some(password => isAuthenticated(encryptPassword(password), req))) {
      next()
    } else {
      sendUserToPasswordPage(req, res)
    }
  }
}

function shouldUseAuth () {
  const configObj = config.getConfig()

  if (!configObj.useAuth) {
    return false
  }

  if (configObj.isProduction) {
    return true
  }

  return false
}

function showNoPasswordError (res) {
  console.error('Password is not set.')
  return res.send('<h1>Error:</h1><p>Password not set. <a href="https://prototype-kit.service.gov.uk/docs/publishing#setting-a-password">See guidance for setting a password</a>.</p>')
}

function sendUserToPasswordPage (req, res) {
  const returnURL = url.format({
    pathname: req.path,
    query: req.query
  })
  const passwordPageURL = url.format({
    pathname: '/manage-prototype/password',
    query: { returnURL }
  })
  res.redirect(passwordPageURL)
}

function isAuthenticated (encryptedPassword, req) {
  return req.cookies.authentication === encryptedPassword
}

module.exports = authentication
