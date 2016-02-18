module.exports = function(router){

  // Routes for Tutorial 4

  // Ineligible users are routed to 'ineligible.html'

  router.get('/tutorials/4-data/question-2', function (req, res) {

    var eligible = req.query.eligible;

    if (eligible == "Yes"){

      res.render('tutorials/4-data/question-2');

    } else {

      res.redirect('/tutorials/4-data/ineligible');

    }
    
  });

  // Write the user input to the check your answers page

  router.get('/tutorials/4-data/check-your-answers-page', function (req, res) {

    var feat = req.query.feat;

    res.render('tutorials/4-data/check-your-answers-page', { 'feat' : feat });
    
  });

}