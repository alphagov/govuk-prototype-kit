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

In the `phase_banner` block in `layout.html` add either;

`{% include "includes/phase_banner_alpha.html" %}` to add an Alpha phase banner, or add;

`{% include "includes/phase_banner_beta.html" %}` to add a Beta phase banner.
