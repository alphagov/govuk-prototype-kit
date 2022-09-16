// Run this code when a form is submitted to 'juggling-balls-answer'
// eslint-disable-next-line

router.post('/juggling-balls-answer', middlewareFunctions, function (req, res) {
  // Make a variable and give it the value from 'how-many-balls'
  console.log(middlewareFunctions)
  const howManyBalls = req.session.data['how-many-balls']

  // Check whether the variable matches a condition
  if (howManyBalls === '3 or more') {
    // Send user to next page
    res.redirect('/juggling-trick')
  } else {
    // Send user to ineligible page
    res.redirect('/ineligible')
  }
})
