module.exports = function(router){

  // Routes for Tutorial 3
  //
  // Ineligible users are routed to 'ineligible.html'

  router.get('/tutorials/3-routes/question-2', function (req, res) {

    var eligible = req.query.eligible;

    if (eligible == "Yes"){

      res.render('tutorials/3-routes/question-2');

    } else {

      res.redirect('/tutorials/3-routes/ineligible');

    }
    
  });

}