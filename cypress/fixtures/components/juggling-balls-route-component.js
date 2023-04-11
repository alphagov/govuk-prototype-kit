// Run this code when a form is submitted to 'juggling-balls-answer'
// eslint-disable-next-line
router.post('/juggling-balls-answer', (req, res) => {
    // Make a variable and give it the value from 'how-many-balls'
    const howManyBalls = req.session.data['how-many-balls'];
    // Check whether the variable matches a condition
    if (howManyBalls === '3 or more') {
        // Send user to next page
        res.redirect('/juggling-trick');
    }
    else {
        // Send user to ineligible page
        res.redirect('/ineligible');
    }
});
