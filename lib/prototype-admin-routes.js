// NPM dependencies
const express = require('express')
const router = express.Router()

// Local dependencies
const encryptPassword = require('./utils').encryptPassword

const password = process.env.PASSWORD

// Clear all data in session
router.post('/clear-data', function (req, res) {
  req.session.data = {}
  res.render('prototype-admin/clear-data-success')
})

// Render password page with a returnURL to redirect people to where they came from
router.get('/password', function (req, res) {
  const returnURL = req.query.returnURL || '/'
  const error = req.query.error
  res.render('prototype-admin/password', { returnURL, error })
})

// Check authentication password
router.post('/password', function (req, res) {
  const submittedPassword = req.body._password
  const returnURL = req.body.returnURL

  if (submittedPassword === password) {
    // see lib/middleware/authentication.js for explanation
    res.cookie('authentication', encryptPassword(password), {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: 'None', // Allows GET and POST requests from other domains
      httpOnly: true,
      secure: true
    })
    res.redirect(returnURL)
  } else {
    res.redirect('/prototype-admin/password?error=wrong-password&returnURL=' + encodeURIComponent(returnURL))
  }
})

module.exports = router
