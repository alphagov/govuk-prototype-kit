exports.mustacheRender = function(req, res, next) {
 
  var render = res.render;
 
  res.render = function(view, options, fn) {

    var self = this,
      options = options || {},
      req = this.req,
      app = req.app;

    if (typeof options == 'function') {
      fn = options, options = {};
    }

    var wrapHTML = function(err, str){
      if (err) return req.next(err);
      
      res.render('../govuk/views/govuk_template', {
          'pageTitle': options.pageTitle || "",
          'assetPath': '/public/',
          'head': '<link href="/public/stylesheets/application.css" rel="stylesheet" type="text/css" />',
          'content': str
        }, function(err, str){

        self.send(str);

      });

    };

    if (typeof fn != 'function') {
      fn = wrapHTML;
    }

    render.call(self, view, options, function(err, str) {
      fn(err, str);
    });
  };
  
  next();

};