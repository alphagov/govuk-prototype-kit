var rp = require('request-promise');
var cheerio = require('cheerio'); // Basically jQuery for node.js 

class Scraper
{
  constructor(req, res){
    this.req = req;
    this.res = res;
  }

  getAndRenderContent(opts = {}){
    var options = {
      uri: opts.uri,
      transform: function (body) {
          return cheerio.load(body);
      }
   };
   
   var _this = this;

   return rp(options)
    .then(function ($) {
        // gets HTML
        var _html = $.html();
        
        /* Queries HTML object */
        if (opts.findQuery) {
          _html = $(_html).find(opts.findQuery).html();
        }

        // displays HTML
        _this.res.send(_html);
    })
    .catch(function (err) {
        // sends back error message
        _this.res.send(err);
    });
  }
}


module.exports = Scraper;