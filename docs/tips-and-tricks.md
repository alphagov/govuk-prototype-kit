# Tips and tricks

A few useful things to help you get started.

Take a look in the `app/views/includes/` folder.

## Add your Service name to the header

The Service name and navigation can be found in an include called `propositional_navigation.html`.

    <nav id="proposition-menu">
      <a href="/" id="proposition-name">Service name</a>
    </nav>

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

You also need to set `header_class` to `with-proposition`.

    {% block header_class %}with-proposition{% endblock %}

An example of this can be seen in the [question-page.html](../app/views/examples/question-page.html) template.

## Add a phase banner

Include either the alpha or beta phase banner from the `app/views/includes/` folder.

### How to include an Alpha banner

    {% include "includes/phase_banner_alpha.html" %}

### How to include a Beta banner

    {% include "includes/phase_banner_beta.html" %}


