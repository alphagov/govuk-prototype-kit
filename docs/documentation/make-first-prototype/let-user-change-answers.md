# Let the user change their answers

## Make the ‘Change’ links work

Make the **Change** links on the ‘Check your answers’ page work by adding the right links.

1. In the the `<a>` tag under `{{ data['how-many-balls'] }}`, change the href attribute from `#` to `/juggling-balls`
2. In the the `<a>` tag under `{{ data['most-impressive-trick'] }}`, change the href attribute from `#` to `/juggling-trick`

If you select a **Change** link, you’ll go back to the right question page, but your answer will not appear.

## Show the user's answer in question 1

Add Nunjucks code to show the user's answer in a radios or checkbox component.

Open the `juggling-balls.html` file in your `app/views` folder, and add:

- `{{ checked("how-many-balls", "3 or more") }}` inside the first `<input>` tag
- `{{ checked("how-many-balls", "1 or 2") }}` inside the second `<input>` tag
- `{{ checked("how-many-balls", "None - I cannot juggle") }}` inside the third `<input>` tag

For example your first input tag should now be:

```html
<input class="govuk-radios__input" id="how-many-balls" name="how-many-balls" type="radio" value="3 or more" {{ checked("how-many-balls", "3 or more") }} >
```

Make sure the spelling is exactly the same as the 3 `value` attributes you added when you [created your question pages](create-pages).

Go to [http://localhost:3000/juggling-balls](http://localhost:3000/juggling-balls) and check the journey works by selecting an answer, continuing to the next page, then going back.

## Show the user's answer in question 2

To show the user's answer in a `textarea`, add the same Nunjucks code you [added to the 'Check your answers' page](show-users-answers#showing-data).

1. Open the `juggling-trick.html` file in your `app/views` folder.
2. Find the `<textarea>` you added earlier.
3. Add `{{ data['most-impressive-trick'] }}` between the `<textarea>` and `</textarea>` tags. Do not add any space or line breaks.

Go to [http://localhost:3000/juggling-trick](http://localhost:3000/juggling-trick) and check it works by filling in an answer, continuing to the next page, going back, then refreshing your browser.

[Next (Link your index page to your start page)](link-index-page-start-page)
