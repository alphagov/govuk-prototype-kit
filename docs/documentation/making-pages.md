# Making pages

Save all HTML pages (called templates below) to the `app/views` folder otherwise they won't be recognised by the application.

All template files should have the `.html` extension.

Any template will be automatically served. For example if you add a template called `help.html` and then go to `localhost:3000/help` in your browser, you will see that page.

Folders also work, so you can make the template `views/account/profile.html`, and then view the page by going to `localhost:3000/account/profile`.

For more complex prototypes, you will need to use Nunjucks.

## Nunjucks

All templates used in your app should be written in [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) syntax.

For example, the following route could be added to `routes.js`:

    router.get('/hello-world', function (req, res) {
      res.render('hello_world', {'message' : 'Hello world'});
    });

Our `views/hello_world.html` file would be:

    <html>
        <head><title>Hello world page</title></head>
        <body>
            <p>{{ message }}.</p>
        </body>
    </html>

The resulting HTML page will be:

    <html>
        <head><title>Hello world page</title></head>
        <body>
            <p>Hello world.</p>
        </body>
    </html>

You can read more in the [Nunjucks documentation](https://mozilla.github.io/nunjucks/templating.html).
