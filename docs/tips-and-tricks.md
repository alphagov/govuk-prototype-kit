# Tips and tricks

A few useful things to help you get started.

## Update the Service name

You can change the service name by editing the file '/app/config.js'.

    module.exports = {

      // Service name used in header. Eg: 'Renew your passport'
      serviceName: "Service name goes here",

    };

## Show navigation in the header

Remove the comments surrounding the unordered list with an ID of proposition links.

    <nav id="proposition-menu">
      <a href="/" id="proposition-name">Service name</a>
      <!--
      <ul id="proposition-links">
        <li><a href="url-to-page-1" class="active">Navigation item #1</a></li>
        <li><a href="url-to-page-2">Navigation item #2</a></li>
      </ul>
      -->
    </nav>

An example of this can be seen in the [question-page.html](../app/views/examples/question-page.html) template.

## Add a phase banner

Include either the alpha or beta phase banner from the `app/views/includes/` folder.

### How to include an Alpha banner

    {% include "includes/phase_banner_alpha.html" %}

### How to include a Beta banner

    {% include "includes/phase_banner_beta.html" %}


### How to use session variables 

Run the following in command line:

    npm install express-session

In server.js file add the following with the other includes:

    session = require('express-session')

Then use session in server.js file. For example:

    app.use(session({ secret: 'topSecret', cookie: { maxAge: 60000 }}));

Where `topSecret` could be any secret and `60000` any expiary time that you would like to set.

In routes.js file store session variable. For example: 

    req.session.sessionName = someValue;

See: https://github.com/expressjs/session for more details.
