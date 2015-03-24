# Making pages

Save all HTML pages (called templates below) to the `app/views` folder otherwise they won't be recognised by the application.

All template files should have the `.html` extension.

Any template will be automatically served. For example if you add a template called `help.html` and then go to `localhost:3000/help` in your browser, you will see that page.

Folders also work, so you can make the template `views/account/profile.html`, and then view the page by going to `localhost:3000/account/profile`.

For more complex prototypes, you will need to use Mustache.

## Mustache

All templates used in the prototyping application (app) should be written in the Mustache language. Its specification is listed on [this page](http://mustache.github.io/mustache.5.html).

### A quick example (from the specification):

A typical Mustache template:

    Hello {{name}}
    You have just won {{value}} dollars!
    {{#in_ca}}
    Well, {{taxed_value}} dollars, after taxes.
    {{/in_ca}}

Given the following **hash**:

    {
      "name": "Chris",
      "value": 10000,
      "taxed_value": 10000 - (10000 * 0.4),
      "in_ca": true
    }

Will produce the following:

    Hello Chris
    You have just won 10000 dollars!
    Well, 6000.0 dollars, after taxes.

### Using Mustache in the app

When working with the prototyping app, your version of the above exists like so:

The following route (where the `response` parameter is `res`) would sit in [routes.js](../app/routes.js):

    app.get('/hello-world', function (req, res) {
      res.render('hello_world', {'message' : 'Hello world'});
    });

In the above, the Mustache template is `views/hello_world` and the **hash** is `{'message' : 'Hello world'}`.

Our `views/hello_world.html` file would be:

    <html>
        <head><title>Hello world page</title></head>
        <body>
            <p>{{message}}.</p>
        </body>
    </html>
    
The resulting HTML page will be:

    <html>
        <head><title>Hello world page</title></head>
        <body>
            <p>Hello world.</p>
        </body>
    </html>

Have a look in those files and try the following:

1. change the `message` value and get it to appear in the resulting page
2. change the name of the `message` key without it breaking
3. add some other types of variables from the specification

One thing to bear in mind when using Mustache is that any variables specified in your templates but not sent in as data will just not be included. This is important because you can include variables on all page that might not be used on certain ones without causing an error.

## Template Inheritance

### What is template inheritance?

Websites (and thus prototypes of them) have lots of pages and chances are those pages will share a lot of code. For example, [www.gov.uk/vat-rates](https://www.gov.uk/vat-rates) & [www.gov.uk/bank-holidays](https://www.gov.uk/bank-holidays) all share the same header and footer.

Templates traditionally use inheritance to stop you needing to duplicate the blocks of HTML pages share. With inheritance you can write the code once, in a **layout** and tell all the pages to inherit that layout. 

When a page is requested, the templating language will work out what it should inherit from the layout and use that to render the page.

### Mustache inheritance

As well as the features you get in standard Mustache, the prototyping app also contains an implementation of [this proposal](https://gist.github.com/spullara/1854699) for template inheritance.

That Gist explains it pretty well, you can have many levels of inheritance but they are all doing one thing: specifying what appears in certain blocks of the page.

So for example, given the following:

We have a base template of `views/base_level.html`:

    <html>
        <head>
            <title>{{$pageTitle}}{{/pageTitle}}</title>
        </head>
        <body>
            <p>Section: {{$section}}{{/section}}</p>
            <h1>{{$pageHeading}}{{/pageHeading}}</h1>
            {{$content}}{{/content}}
        </body>
    </html>
    
We also have another template to set the section called `views/section_level.html`:

    {{<base_level}}
    {{$section}}Guides{{/section}}
    {{base_level}}
    
An example page is `views/page_level.html`:

    {{<section_level}}
    {{$pageTitle}}Inheritance test page{{/pageTitle}}
    {{$pageHeading}}Inheritance test page{{/pageHeading}}
    {{$content}}
      <p>{{message}}</p>
    {{/content}}
    {{section_level}}
    
We have the following route:

    app.get('/page-level', function (req, res) {
      res.render('page_level', {'message' : 'Hello world'});
    });

With all of the above, the resulting HTML page will be:

    <html>
        <head>
            <title>Inheritance test page</title>
        </head>
        <body>
            <p>Section: Guides</p>
            <h1>Inheritance test page</h1>
            <p>Hello world</p>
        </body>
    </html>

Note that tags specifying the template to inherit from need to match the template name without extension. So `{{<page_level}}` will point to the template `page_level.html`. Unlike templates in `routes.js`, the inheritance part of Mustache doesn't need to know exactly where these templates are in `/views`, just their names.

Again, have a look in those files and try changing things to get an idea of what's going on. 

### Partials

Partials are fragments of HTML you can include in your templates that let you keep common components separate from your templates.

Partials are included using a tag like the inheritance one but with a right-arrow:

    {{>logo}}
    
Try using the `views/logo.html` file in your base template like so:

    <html>
        <head>
            <title>{{$pageTitle}}{{/pageTitle}}</title>
        </head>
        <body>
            {{>logo}}
            <p>Section: {{$section}}{{/section}}</p>
            <h1>{{$pageHeading}}{{/pageHeading}}</h1>
            {{$content}}{{/content}}
        </body>
    </html>
    
The `views/logo.html` should be:

    <p>Prototyping application</p>
    
You should find the resulting HTML page will be:

    <html>
        <head>
            <title>Inheritance test page</title>
        </head>
        <body>
            <p>Prototyping application</p>
            <p>Section: Guides</p>
            <h1>Inheritance test page</h1>
            <p>Hello world</p>
        </body>
    </html>

It's important to note that this form of inheritance works by combining all the templates into one and then rendering the result with Mustache. In other words, the final combination of the above before rendering would be:

    <html>
        <head>
            <title>{{$pageTitle}}Inheritance test page{{/pageTitle}}</title>
        </head>
        <body>
            {{>logo}}
            <p>Section: {{$section}}Guides{{/section}}</p>
            <h1>{{$pageHeading}}{{/pageHeading}}</h1>
            {{$content}}
            <p>Hello world</p>
            {{/content}}
        </body>
    </html>
    
Because of this, partial tags should only be included either in the top-level template or in a block.

Rendering only takes place once the templates have been combined so partial tags in child templates cannot be parsed and so will break the render.

All partials are kept in the [includes](../app/views/includes/) folder.

## Inheriting the GOV.UK template

Pages in the prototyping app are set up to use the [govuk_template](https://github.com/alphagov/govuk_template) as the base template in an inheritance chain. Have a look at the template files `views/layout.html` and `views/index.html` to see an example.

### Template blocks

All the tags in the GOV.UK template are listed in the `views/template_partial_areas.html` page. You can see how they fit into the rendered page by starting the app and going to [http://localhost:3000/examples/template-partial-areas](http://localhost:3000/examples/template-partial-areas).
