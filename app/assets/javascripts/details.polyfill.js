// <details> polyfill
// http://caniuse.com/#feat=details

// FF Support for HTML5's <details> and <summary>
// https://bugzilla.mozilla.org/show_bug.cgi?id=591737

// http://www.sitepoint.com/fixing-the-details-element/

(function () {

  // Add event construct for modern browsers or IE
  // which fires the callback with a pre-converted target reference
  function addEvent(node, type, callback) {
    if (node.addEventListener) {
      node.addEventListener(type, function (e) {
        callback(e, e.target);
      }, false);
    } else if (node.attachEvent) {
      node.attachEvent('on' + type, function (e) {
        callback(e, e.srcElement);
      });
    }
  }

  // Handle cross-modal click events
  function addClickEvent(node, callback) {
    var keydown = false;
    addEvent(node, 'keydown', function () {
      keydown = true;
    });
    addEvent(node, 'keyup', function (e, target) {
      keydown = false;
      if (e.keyCode === 13) { callback(e, target); }
    });
    addEvent(node, 'click', function (e, target) {
      if (!keydown) { callback(e, target); }
    });
  }

  // Get the nearest ancestor element of a node that matches a given tag name
  function getAncestor(node, match) {
    do {
      if (!node || node.nodeName.toLowerCase() === match) {
        break;
      }
    } while (node = node.parentNode);

    return node;
  }

  // Create a started flag so we can prevent the initialisation
  // function firing from both DOMContentLoaded and window.onload
  var started = false;

  // Initialisation function
  function addDetailsPolyfill(list) {

    // If this has already happened, just return
    // else set the flag so it doesn't happen again
    if (started) {
      return;
    }
    started = true;

    // Get the collection of details elements, but if that's empty
    // then we don't need to bother with the rest of the scripting
    if ((list = document.getElementsByTagName('details')).length === 0) {
      return;
    }

    // else iterate through them to apply their initial state
    var n = list.length, i = 0;
    for (n; i < n; i++) {
      var details = list[i];

      // Detect native implementations
      details.__native = typeof(details.open) == 'boolean';

      // Save shortcuts to the inner summary and content elements
      details.__summary = details.getElementsByTagName('summary').item(0);
      details.__content = details.getElementsByTagName('div').item(0);

      // If the content doesn't have an ID, assign it one now
      // which we'll need for the summary's aria-controls assignment
      if (!details.__content.id) {
        details.__content.id = 'details-content-' + i;
      }

      // Add role=button to summary
      details.__summary.setAttribute('role', 'button');

      // Add aria-controls
      details.__summary.setAttribute('aria-controls', details.__content.id);

      // Set tabindex so the summary is keyboard accessible
      details.__summary.setAttribute('tabindex', '0');

      // Detect initial open/closed state
      var detailsAttr = details.hasAttribute('open');
      if (typeof detailsAttr !== 'undefined' && detailsAttr !== false) {
        details.__summary.setAttribute('aria-expanded', 'true');
        details.__content.setAttribute('aria-hidden', 'false');
      } else {
        details.__summary.setAttribute('aria-expanded', 'false');
        details.__content.setAttribute('aria-hidden', 'true');
        details.__content.style.display = 'none';
      }

      // Create a circular reference from the summary back to its
      // parent details element, for convenience in the click handler
      details.__summary.__details = details;

      // If this is not a native implementation, create an arrow
      // inside the summary, saving its reference as a summary property
      if (!details.__native) {
        var twisty = document.createElement('i');
        twisty.className = 'arrow arrow-closed';
        twisty.appendChild(document.createTextNode('\u25ba'));
        details.__summary.__twisty = details.__summary.insertBefore(twisty, details.__summary.firstChild);
      }
    }

    // Define a statechange function that updates aria-expanded and style.display
    // Also update the arrow position
    function statechange(summary) {

      // Update aria-expanded attribute on click
      var expanded = summary.__details.__summary.getAttribute('aria-expanded') == 'true';
      var hidden = summary.__details.__content.getAttribute('aria-hidden') == 'true';

      summary.__details.__summary.setAttribute('aria-expanded', (expanded ? 'false' : 'true'));
      summary.__details.__content.setAttribute('aria-hidden', (hidden ? 'false' : 'true'));
      summary.__details.__content.style.display = (expanded ? 'none' : 'block');

      if (summary.__twisty) {
        summary.__twisty.firstChild.nodeValue = (expanded ? '\u25ba' : '\u25bc');
        summary.__twisty.setAttribute('class', (expanded ? 'arrow arrow-closed' : 'arrow arrow-open'));
      }

      return true;
    }

    // Bind a click event to handle summary elements
    addClickEvent(document, function(e, summary) {
      if (!(summary = getAncestor(summary, 'summary'))) {
        return true;
      }
      return statechange(summary);
    });
  }

  // Bind two load events for modern and older browsers
  // If the first one fires it will set a flag to block the second one
  // but if it's not supported then the second one will fire
  addEvent(document, 'DOMContentLoaded', addDetailsPolyfill);
  addEvent(window, 'load', addDetailsPolyfill);

})();
