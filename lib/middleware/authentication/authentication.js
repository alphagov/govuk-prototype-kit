/**
 * Simple basic auth middleware for use with Express 4.x.
 *
 * Based on template found at: http://www.danielstjules.com/2014/08/03/basic-auth-with-express-4/
 *
 * @example
 * const authentication = required('authentication.js')
 * app.use(authentication)
 *
 * @param   {string}   req Express Request object
 * @param   {string}   res Express Response object
 * @returns {function} Express 4 middleware requiring the given credentials
 */

module.exports = function (req, res, next) {
  // NPM Dependencies
  const basicAuth = require('basic-auth')

  // Local dependencies
  const config = require('../../../app/config.js')

  // Local Variables
  const env = (process.env.NODE_ENV || 'development').toLowerCase()
  const useAuth = (process.env.USE_AUTH || config.useAuth).toLowerCase()
  const username = (typeof process.env.USERNAME !== 'undefined') ? process.env.USERNAME : false
  const password = (typeof process.env.PASSWORD !== 'undefined') ? process.env.PASSWORD : false

  if (env === 'production' && useAuth === 'true') {
    if (!username || !password) {
      console.error('Username or password is not set.')
      return res.send('<h1>Error:</h1><p>Username or password not set. <a href="https://govuk-prototype-kit.herokuapp.com/docs/publishing-on-heroku#6-set-a-username-and-password">See guidance for setting these</a>.</p>')
    }

    const user = basicAuth(req)

    if (!user || user.name !== username || user.pass !== password) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required')
      return res.sendStatus(401)
    }
  }
  next()
}
