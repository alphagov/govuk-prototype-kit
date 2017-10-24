# Writing client side JavaScript

JavaScript is a programming language that can add interactivity to your prototype i.e validation, redirects or data storage.

[More information](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics) about JavaScript.

This is a guide is for client side JavaScript - this runs in the browser. You can also write server side JavaScript that is ran before the page is sent to the user.

## Working with the current JavaScript

Currently the kit has various JavaScript files under ``app/assets/javascripts/``.

This has a few scripts that are included by default

- [application.js](/public/javascripts/application.js)
- [Details polyfil](/public/javascripts/details.polyfill.js)
- [jQuery](/public/javascripts/jquery-1.11.3.js)

These are loaded into each of the prototypes pages via ``app/views/includes/scripts.html``.

The prototype toolkit also has [jQuery](https://jquery.com/), which means you have the option of not writing pure JavaScript.

## Writing new JavaScript

There are a couple of ways of adding new JavaScript, this can be done for every page, or individually.

### Every page

You can write new JavasSript inside ``app/views/includes/scripts/application.js``.

```
$(document).ready(function () {
  // Use GOV.UK shim-links-with-button-role.js to trigger 
  // a link styled to look like a button,
  // with role="button" when the space key is pressed.
  GOVUK.shimLinksWithButtonRole.init()

  // Show and hide toggled content
  // Where .multiple-choice uses the data-target attribute
  // to toggle hidden content
  var showHideContent = new GOVUK.ShowHideContent()
  showHideContent.init()
})
```

Any JavaScript within this file will be loaded onto every page.

This file has a has a jQuery wrapper that only activates when the page is loaded.

```
// example of ready function
$(document).ready(function () {
  // any JavaScript within this will be run after the page has loaded.
})
```

## Direct in the page

JavaScript can be directly written in a file.

You can define a block that will add the JavaScript to the page, this needs to be done in the ``.html`` file.

```
{% block page_scripts %}
  <script>
    alert('this is javascript on the page');
  </script>
{% endblock %}
```

## Separate Files

You can also create different files, this might be handy if you have a lot of JavaScript.

You can create new files under ``app/assets/javascripts/`` these will be copied to the ``public/javascripts/`` folder.

You can then add these scripts to pages in a couple of ways.

### All pages

To add a seperate JavaScript file to all pages you need to edit ``app/views/includes/scripts.html``.

```
<!-- Javascript -->
<script src="/public/javascripts/details.polyfill.js"></script>
<script src="/public/javascripts/jquery-1.11.3.js"></script>
<script src="/public/javascripts/govuk/shim-links-with-button-role.js"></script>
<script src="/public/javascripts/govuk/show-hide-content.js"></script>
<script src="/public/javascripts/application.js"></script>

{% if useAutoStoreData %}
  <script src="/public/javascripts/auto-store-data.js"></script>
{% endif %}

<!-- New Scripts -->
<script src="/public/javascripts/new_script.js"></script>
<script src="/public/javascripts/other_new_script.js"></script>
```

### Single page

You can also add javascript on each page by editing the ``.html`` we need to define a page_scripts block.

Addtional scripts can be added to the page by doing the following, this will keep the excisting scripts and add the new ones.

```
{% block page_scripts %}
  <script src="/public/javascripts/other_new_script.js"></script>
{% endblock %}
```


You can also override the whole scripts block, this is in the ``scripts.html``, but if you want current scripts on - do not do this.

```
{% block scripts %}
  <script src="/public/javascripts/other_new_script.js"></script>
{% endblock %}
```

## Links

<ul class="list list-bullet">
  <li><a href="creating-routes">Creating routes</a></li>
</ul>