# Create pages

## Open your project

### Mac

In Atom, select **File** then **Open**. Then select your project folder.

### Windows

In Atom, select **File** then **Open Folder**. Then select your project folder.

## Create pages by copying templates

Create pages by copying template files.

To copy a file in Atom:

1. Right-click a file in the folders list on the left and select **Copy**.
2. Right-click the folder you want to copy the file into and select **Paste**.   

### Create a start page

Copy the `start.html` file from `docs/views/templates` to `app/views`.

Preview the pages in your prototype by going to ht<span>tp</span>://localhost:3000/NAME-OF-HTML-FILE in your web browser. For example, go to [http://localhost:3000/start](http://localhost:3000/start) to preview `start.html`.

#### Change the service name

1. Open the `config.js` file in your `app` folder.
2. Change the value of the `serviceName` variable from `My service name` to `Apply for a juggling licence`.
3. Press Cmd+S on Mac or Ctrl+S on Windows to save your change.

This will change the service name on every page.

You must save every time you make a change to a file. Your changes will automatically show in your browser when you refresh the page.

### Question pages

Make 2 copies of the `question.html` file from `docs/views/templates` to `app/views`.

Rename the 2 file copies to:

- `juggling-balls.html`
- `juggling-trick.html`

Go to the following URLs to check your pages:

- http://localhost:3000/juggling-balls
- http://localhost:3000/juggling-trick

In the ‘juggling-balls.html’ file, change the text inside the `h1` tag from `Heading or question goes here` to `How many balls can you juggle?`.

In the ‘juggling-trick.html’ file, change the text inside the `h1` tag to `What is your most impressive juggling trick?`.

### 'Check your answers' page

Copy the `check-your-answers.html` file from `docs/views/templates` to `app/views`.

### Confirmation page

Copy the `confirmation.html` file from `docs/views/templates` to `app/views`.

[Next (link your pages together)](link-pages-together)
