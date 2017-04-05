var express = require('express')
var router = express.Router()

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// add your routes here

router.post('/lesson-4/juggling-feat', function (req, res) {

  // Make a variable and give it the value from 'juggling-ability'
  var jugglingAbility = req.session.data['juggling-ability']

  // Check whether the variable matches a condition
  if (jugglingAbility == "3 or more"){
    // Send user to next page
    res.redirect('/lesson-4/juggling-feat')
  }
  else {
    // Send user to ineligible page
    res.redirect('/lesson-4/ineligible')
  }

})

module.exports = router
