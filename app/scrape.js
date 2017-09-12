var rp = require('request-promise');
var cheerio = require('cheerio'); // Basically jQuery for node.js 

class Scraper
{
  constructor(req, res){
    this.req = req;
    this.res = res;
  }

  getContent(opts = {}){
    var options = {
      uri: 'https://www.google.com',
      transform: function (body) {
          return cheerio.load(body);
      }
   };
   
   rp(options)
    .then(function ($) {
        // Process html like you would with jQuery... 
        console.log($.html().find('.content'));
    })
    .catch(function (err) {
        // Crawling failed or Cheerio choked... 
    });
  }
}


module.exports = Scraper;