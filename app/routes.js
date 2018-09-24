const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

router.post('/question2', function (req, res) {
  // Get the answer from session data
  // The name between the quotes is the same as the 'name' attribute on the input elements
  // However in JavaScript we can't use hyphens in variable names
	
  let answer = req.session.data['date-started']
  if (answer == 'beforeLAR') {
    res.redirect('/question2a')
  } else {
    res.redirect('/question2')
  }
})

router.post('/question3a', function (req, res) {
  // Get the answer from session data
  // The name between the quotes is the same as the 'name' attribute on the input elements
  // However in JavaScript we can't use hyphens in variable names

  let answer1 = req.session.data['benefits']
  
  if (answer1 == 'yes') {
    res.redirect('/finish-good')
  } else {
    res.redirect('/question3')
  }
})
router.post('/question3', function (req, res) {
  // Get the answer from session data
  // The name between the quotes is the same as the 'name' attribute on the input elements
  // However in JavaScript we can't use hyphens in variable names

  let answer1 = req.session.data['benefits']
  let answer2 = req.session.data['NI-benefits']
  
  if (answer1 == 'yes' && answer2 === 'false') {
    res.redirect('/finish-good')
  } else {
    res.redirect('/question3')
  }
})


module.exports = router

