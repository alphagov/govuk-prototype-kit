# Fixing errors in your JavaScript

If you want to fix errors in your JavaScript you need to:
<ol>
  <li>find where the error happened in your code</li>
  <li>go to that place, while the code is running, and see what happened</li>
</ol>

Most JavaScript errors will appear in the console tab of your browser’s [developer
tools](https://developer.chrome.com/devtools). Each error comes with a message telling you where it
happened:

![Image from the JavaScript console showing an error. The first line is the error message. The
second line gives the file the error came from and the line it happened](/public/images/docs/javascript-error.png)

Once you know where the error is you need to do some debugging to find out more.

## What is debugging?

Debugging is a way of running your code that lets you stop its execution at any point and see what’s going on.

## Why is this useful?

It’s hard to fix errors unless you understand what went wrong.

If you’re lucky, the error itself will contain enough information to diagnose the problem. If not, it’s helpful to be able to see the code at the point the error occurred to get a better idea of what was happening.

## How to debug JavaScript

The best way to learn how to debug JavaScript is to understand the basics and then try it out yourself.

<div class="panel panel-border-wide">
  <p>Start by watching this [video on debugging JavaScript by
Google](https://developers.google.com/web/tools/chrome-devtools/javascript/).
  </p>
  <p>
  It covers all you need to know to debug most JavaScript errors in 8 minutes.
  </p>
</div>

The techniques here will work with any of the JavaScript files loaded by your pages (found in
`/app/assets/javascripts`).

Here are some tutorials for debugging JavaScript in other browsers:
- [in Mozilla Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger)
- [in Microsoft Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide/debugger)

### Debugging server side JavaScript

The kit uses server side JavaScript for things like:
- directing users to different pages based on logic
- responding to input from a form

Code for these kind of things would normally be found in `/app/routes.js`.

The debugger for server side JavaScript doesn’t run automatically like the one in developer tools.

To start the kit with the debugger running:

    npm start -- --inspect

You should see something like this:
<pre><code style="overflow: scroll">Debugger listening on port 9229.
Warning: This is an experimental feature and could change at any time.
To start debugging, open the following URL in Chrome:
    chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:9229/2fd0465b-2248-414e-9df6-67fc033c9d9c
</code></pre>

If you go to `chrome://inspect` in your browser you should see an entry under
'Remote Target' for your prototype with a number next to it for the version of Node you're running:

![Chrome inspect page](/public/images/docs/chrome_inspect_page.png)

If you click the blue 'inspect' link Chrome will open a new developer tools window you can use for
debugging.

Errors in server side JavaScript will appear directly in your browser instead of the page you're
trying to load.

They follow the same format as those in developer tools so should give you details of the error 
and the file it happened in:

![A server side JavaScript error](/public/images/docs/server-side_js_error.png)

## More information

- [The official NodeJS page on debugging](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [Paul Irish presentation on debugging NodeJS](https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae2)
