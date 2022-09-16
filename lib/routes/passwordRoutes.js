let requests = require('../../index').requests
let config = require('../config')
const authentication = require('../middleware/authentication/authentication')

const passwordRouter = requests.setupRouter('/manage-prototype/password', {
  authenticationRequired: false,
  useStandardMiddleware: false
})
// Render password page with a returnURL to redirect people to where they came from
passwordRouter.get('/', function (req, res) {
  const returnURL = req.query.returnURL || '/'
  const error = req.query.error
  res.render(['govuk-prototype-kit', 'internal', 'views', 'manage-prototype', 'password.njk'].join('/'), { returnURL, error })
})
passwordRouter.post('/', function (req, res) {
  const submittedPassword = req.body.password
  const providedUrl = req.body.returnURL
  const processedRedirectUrl = (!providedUrl || providedUrl.startsWith('/manage-prototype/password')) ? '/' : providedUrl

  if (submittedPassword === config.getConfig().password) {
    // see lib/middleware/authentication.js for explanation
    authentication.setCookie(res, submittedPassword)
    res.redirect(processedRedirectUrl)
  } else {
    res.redirect('/manage-prototype/password?error=wrong-password&returnURL=' + encodeURIComponent(processedRedirectUrl))
  }
})
