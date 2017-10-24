var querystring = require('querystring')

/**
 * Middleware helper to enable a prototype to redirect to a successUrl or a failUrl
 * passed to the prototype from a calling prototype via the query parameters successUrl and failUrl.
 * This is very handy for chaining prototypes together or placing agnostic service prototypes
 * in a user journey.
 *
 * http://localhost:3000/redirect?successUrl=http://www.success-url.com&failUrl=http://www.fail-url.com
 *
 * @param req
 * @param res
 * @param next
 */
module.exports = function (req, res, next) {
  var successUrl = req.query.successUrl && querystring.escape(req.query.successUrl)
  var failUrl = req.query.failUrl && querystring.escape(req.query.failUrl)

  if (successUrl) {
    res.cookie('successUrl', successUrl)
  }

  if (failUrl) {
    res.cookie('failUrl', failUrl)
  }

  req.getSuccessUrl = function () {
    var successUrl = req.cookies.successUrl && req.cookies.successUrl
    return successUrl && querystring.unescape(successUrl)
  }

  req.getFailUrl = function () {
    var failUrl = req.cookies.failUrl && req.cookies.failUrl
    return failUrl && querystring.unescape(failUrl)
  }

  next()
}
