// <details> polyfill
// http://caniuse.com/#feat=details

// FF Support for HTML5's <details> and <summary>
// https://bugzilla.mozilla.org/show_bug.cgi?id=591737

// http://www.sitepoint.com/fixing-the-details-element/

(function(){

  //add event construct for modern browsers or IE
  //which fires the callback with a pre-converted target reference
  function addEvent(node, type, callback) {
    if(node.addEventListener)
    {
      node.addEventListener(type, function(e)
      {
        callback(e, e.target);

      }, false);
    }
    else if(node.attachEvent)
    {
      node.attachEvent('on' + type, function(e)
      {
        callback(e, e.srcElement);
      });
    }
  }

  //handle cross-modal click events
  function addClickEvent(node, callback) {
    var keydown = false;
    addEvent(node, 'keydown', function()
    {
      keydown = true;
    });
    addEvent(node, 'keyup', function(e, target)
    {
      keydown = false;
      if(e.keyCode == 13) { callback(e, target); }
    });
    addEvent(node, 'click', function(e, target)
    {
      if(!keydown) { callback(e, target); }
    });
  }

  //get the nearest ancestor element of a node that matches a given tag name
  function getAncestor(node, match) {
    do
    {
      if(!node || node.nodeName.toLowerCase() == match)
      {
        break;
      }
    }
    while(node = node.parentNode);

    return node;
  }



  //create a started flag so we can prevent the initialisation
  //function firing from both DOMContentLoaded and window.onloiad
  var started = false;

  //initialisation function
  function addDetailsPolyfill(list) {
    //if this has already happened, just return
    //else set the flag so it doesn't happen again
    if(started)
    {
      return;
    }
    started = true;

    //get the collection of details elements, but if that's empty
    //then we don't need to bother with the rest of the scripting
    if((list = document.getElementsByTagName('details')).length == 0)
    {
      return;
    }

    //else iterate through them to apply their initial state
    for(var n = list.length, i = 0; i < n; i ++)
    {
      var details = list[i];

      //detect native implementations
      details.__native = typeof(details.open) == 'boolean';

      //save shortcuts to the inner summary and content elements
      details.__summary = details.getElementsByTagName('summary').item(0);
      details.__content = details.getElementsByTagName('div').item(0);

      //if the content doesn't have an ID, assign it one now
      //which we'll need for the summary's aria-controls assignment
      if(!details.__content.id)
      {
        details.__content.id = 'details-content-' + i;
      }

      //then define aria-controls on the summary to point to that ID
      //so that assistive technologies know it controls the aria-expanded state
      details.__summary.setAttribute('aria-controls', details.__content.id);

      //also set tabindex so the summary is keyboard accessible
      details.__summary.setAttribute('tabindex', '0');

      //then set aria-expanded and style.display and remove the
      //open attribute, so this region is now collapsed by default
      details.__content.setAttribute('aria-expanded', 'false');
      details.__content.style.display = 'none';
      details.removeAttribute('open');

      //create a circular reference from the summary back to its
      //parent details element, for convenience in the click handler
      details.__summary.__details = details;

      //then if this is not a native implementation, create an arrow
      //inside the summary, saving its reference as a summary property
      if(!details.__native)
      {
        var twisty = document.createElement('i');
        twisty.className = 'arrow arrow-closed';
        twisty.appendChild(document.createTextNode('\u25ba'));

        details.__summary.__twisty = details.__summary.insertBefore(twisty, details.__summary.firstChild);
      }
    }


    //define a statechange function that updates aria-expanded and style.display
    //to expand or collapse the region (ie. invert the current state)
    //then update the twisty if we have one with a correpsonding glyph
    function statechange(summary) {
      var expanded = summary.__details.__content.getAttribute('aria-expanded') == 'true';

      summary.__details.__content.setAttribute('aria-expanded', (expanded ? 'false' : 'true'));
      summary.__details.__content.style.display = (expanded ? 'none' : 'block');

      if(summary.__twisty)
      {
        summary.__twisty.firstChild.nodeValue = (expanded ? '\u25ba' : '\u25bc');
        summary.__twisty.setAttribute('class', (expanded ? 'arrow arrow-closed' : 'arrow arrow-open'));
      }

      return true;
    }

    //now bind a document click event to handle summary elements
    //if the target is not inside a summary element, just return true
    //to pass-through the event, else call and return the statechange function
    //which also returns true to pass-through the remaining event
    addClickEvent(document, function(e, summary) {
      if(!(summary = getAncestor(summary, 'summary')))
      {
        return true;
      }
      return statechange(summary);
    });
  }

  //then bind two load events for modern and older browsers
  //if the first one fires it will set a flag to block the second one
  //but if it's not supported then the second one will fire
  addEvent(document, 'DOMContentLoaded', addDetailsPolyfill);
  addEvent(window, 'load', addDetailsPolyfill);

  })();
