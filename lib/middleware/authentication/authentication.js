// Core dependencies
const url = require('url')

// Local dependencies
const config = require('../../config')
const crypto = require('crypto')

const encryptPassword = function (password) {
  const hash = crypto.createHash('sha256')
  hash.update(password)
  return hash.digest('hex')
}

// Local variables
const allowedPathsWhenUnauthenticated = [
  '/manage-prototype/password',
  '/public/stylesheets/unbranded.css',
  '/extension-assets/govuk-prototype-kit/lib/assets/images/unbranded.ico',
  '/extension-assets/govuk-frontend/govuk/all.js']

function middleware () {
  if (!shouldUseAuth()) {
    return function doNothing (req, res, next) {
      next()
    }
  }

  if (!config.getConfig().password) {
    return function showErrors (req, res, next) {
      showNoPasswordError(res)
    }
  }

  // password is encrypted because we store it in a cookie
  // we store the password to compare in case it is changed server-side
  // changing the password should require users to re-authenticate
  const password = encryptPassword(config.getConfig().password)

  return function authentication (req, res, next) {
    if (allowedPathsWhenUnauthenticated.includes(req.path)) {
      next()
    } else if (isAuthenticated(password, req)) {
      next()
    } else {
      sendUserToPasswordPage(req, res)
    }
  }
}

module.exports = {
  middleware,
  setCookie
}

function setCookie (res, password) {
  res.cookie('authentication', encryptPassword(password), {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    sameSite: 'None', // Allows GET and POST requests from other domains
    httpOnly: true,
    secure: true
  })
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
  return res.send('<h1>Error:</h1><p>Password not set. <a href="https://govuk-prototype-kit.herokuapp.com/docs/publishing-on-heroku#6-set-a-password">See guidance for setting a password</a>.</p>')
}

function sendUserToPasswordPage (req, res) {
  const returnURL = url.format({
    pathname: req.path,
    query: req.query
  })
  console.log('sending user to password page', returnURL)
  const passwordPageURL = url.format({
    pathname: '/manage-prototype/password',
    query: { returnURL }
  })
  res.redirect(passwordPageURL)
}

function isAuthenticated (encryptedPassword, req) {
  return req.cookies.authentication === encryptedPassword
}
