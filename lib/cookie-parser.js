// First-party middleware for parsing cookies, replacing the `cookie-parser`
// package. We only ever read unsigned cookies, so this parses the Cookie
// header into `req.cookies` and nothing more.

function parseCookies (cookieHeader) {
  const cookies = {}
  if (!cookieHeader) {
    return cookies
  }
  cookieHeader.split(';').forEach((cookie) => {
    const separatorIndex = cookie.indexOf('=')
    if (separatorIndex === -1) {
      return
    }
    const name = cookie.slice(0, separatorIndex).trim()
    if (name in cookies) {
      return
    }
    const value = cookie.slice(separatorIndex + 1).trim()
    cookies[name] = decodeURIComponent(value)
  })
  return cookies
}

function cookieParser () {
  return (req, res, next) => {
    req.cookies = parseCookies(req.headers.cookie)
    next()
  }
}

module.exports = cookieParser
