# Link your pages together

To take users from one page to another, you can use either:

- a link (`<a>` tag)
- a form (`<form>` tag, when the user inputs data)

## Link your start page to question 1

1. Open `start.html` in your `app/views` folder.
2. Find the `<a>` tag with 'Start now' inside.
3. Change the value of the `href` attribute from `#` to `/juggling-balls`.

Go to http://localhost:3000/start and select the **Start now** button to check the link works.

Links normally appear as text with underlines. We make **Start now** look like a button to make it more obvious to users.

## Link question 1 to question 2

1. Open `juggling-balls.html` in your `app/views` folder.
2. Find the line `<form class="form" action="/url/of/next/page" method="post">`.
3. Change the value of the `action` attribute from `/url/of/next/page` to `/juggling-trick`.

Go to http://localhost:3000/juggling-balls and select **Continue** to check the button works.

This time it's a real HTML button, not a link. Buttons submit form data - the URL is on the form tag, not the button.

## Link question 2 to your 'Check your answers' page

1. Open `juggling-trick.html` in your `app/views` folder.
2. Find the line `<form class="form" action="/url/of/next/page" method="post">`.
3. Change the value of the `action` attribute from `/url/of/next/page` to `/check-your-answers`.

Go to http://localhost:3000/juggling-trick and select **Continue** to check the button works.

The 'Check your answers' page template links to the ‘Confirmation’ page by default. So you do not need to change the ‘Check your answers’ page.

[Next (use components from the Design System)](use-components)
