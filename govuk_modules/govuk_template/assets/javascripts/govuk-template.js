(function () {
  "use strict"
  var root = this;
  if(typeof root.GOVUK === 'undefined') { root.GOVUK = {}; }

  /*
    Cookie methods
    ==============

    Usage:

      Setting a cookie:
      GOVUK.cookie('hobnob', 'tasty', { days: 30 });

      Reading a cookie:
      GOVUK.cookie('hobnob');

      Deleting a cookie:
      GOVUK.cookie('hobnob', null);
  */
  GOVUK.cookie = function (name, value, options) {
    if(typeof value !== 'undefined'){
      if(value === false || value === null) {
        return GOVUK.setCookie(name, '', { days: -1 });
      } else {
        return GOVUK.setCookie(name, value, options);
      }
    } else {
      return GOVUK.getCookie(name);
    }
  };
  GOVUK.setCookie = function (name, value, options) {
    if(typeof options === 'undefined') {
      options = {};
    }
    var cookieString = name + "=" + value + "; path=/";
    if (options.days) {
      var date = new Date();
      date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000));
      cookieString = cookieString + "; expires=" + date.toGMTString();
    }
    if (document.location.protocol == 'https:'){
      cookieString = cookieString + "; Secure";
    }
    document.cookie = cookieString;
  };
  GOVUK.getCookie = function (name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for(var i = 0, len = cookies.length; i < len; i++) {
      var cookie = cookies[i];
      while (cookie.charAt(0) == ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  };
}).call(this);
(function () {
  "use strict"
  var root = this;
  if(typeof root.GOVUK === 'undefined') { root.GOVUK = {}; }

  GOVUK.addCookieMessage = function () {
    var message = document.getElementById('global-cookie-message'),
        hasCookieMessage = (message && GOVUK.cookie('seen_cookie_message') === null);

    if (hasCookieMessage) {
      message.style.display = 'block';
      GOVUK.cookie('seen_cookie_message', 'yes', { days: 28 });
    }
  };
}).call(this);
(function() {
  "use strict"

  // fix for printing bug in Windows Safari
  var windowsSafari = (window.navigator.userAgent.match(/(\(Windows[\s\w\.]+\))[\/\(\s\w\.\,\)]+(Version\/[\d\.]+)\s(Safari\/[\d\.]+)/) !== null),
      style;

  if (windowsSafari) {
    // set the New Transport font to Arial for printing
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('media', 'print');
    style.innerHTML = '@font-face { font-family: nta !important; src: local("Arial") !important; }';
    document.getElementsByTagName('head')[0].appendChild(style);
  }


  // add cookie message
  if (window.GOVUK && GOVUK.addCookieMessage) {
    GOVUK.addCookieMessage();
  }

  // header navigation toggle
  if (document.querySelectorAll && document.addEventListener){
    var els = document.querySelectorAll('.js-header-toggle'),
        i, _i;
    for(i=0,_i=els.length; i<_i; i++){
      els[i].addEventListener('click', function(e){
        e.preventDefault();
        var target = document.getElementById(this.getAttribute('href').substr(1)),
            targetClass = target.getAttribute('class') || '',
            sourceClass = this.getAttribute('class') || '';

        if(targetClass.indexOf('js-visible') !== -1){
          target.setAttribute('class', targetClass.replace(/(^|\s)js-visible(\s|$)/, ''));
        } else {
          target.setAttribute('class', targetClass + " js-visible");
        }
        if(sourceClass.indexOf('js-hidden') !== -1){
          this.setAttribute('class', sourceClass.replace(/(^|\s)js-hidden(\s|$)/, ''));
        } else {
          this.setAttribute('class', sourceClass + " js-hidden");
        }
      });
    }
  }
}).call(this);



