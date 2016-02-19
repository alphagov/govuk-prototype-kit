# Updating the kit

**Important note**

If you have made any changes outside the `app` folder, this process will destroy those changes. We will try and improve the update process to avoid this, but in the meantime you will need to make a note of your changes outside `app`, and add them back after updating.

## Steps

Download the latest prototype kit zip file from GitHub

In your project, delete everything apart from the `app` and `.git` folder

Copy everything from the latest kit to your project, apart from the `app` folder


## Converting old prototypes

Earlier versions of the prototype kit used a different templating language called Mustache.

Converting Mustache templates to Nunjucks ones is relatively simple. Here are the main things you'll need to do:

### Template inheritance

    {{<layout}}

    {{/layout}}

Becomes…

    {% extends "layout.html" %}

### Template blocks

    {{$pageTitle}}
        GOV.UK prototype kit
    {{/pageTitle}}

Becomes…

    {% block page_title %}
        GOV.UK prototype kit
    {% endblock %}

and

    {{$content}}
    .......
    {{/content}}
    
Becomes...

    {% block content %}
    ........
    {% endblock %}
    
### Includes

    {{>includes/breadcrumbs}}

Becomes…

    {% include "includes/breadcrumbs.html" %}
