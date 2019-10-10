# Show the user's answers on your 'Check your answers' page

If you do research with real user data, you must [open a new incognito window](https://support.google.com/chrome/answer/95464) for each research session, and close all windows before the next session.

After the session is over, select the **Clear data** link at the bottom of the prototype to clear the user’s data.

Check you’ve cleared the data by returning to a previously-loaded page and making sure the data is gone.

## Showing data

To display user data on a different page, use this [Nunjucks](https://mozilla.github.io/nunjucks/) code:

```
{{ data['INPUT-ATTRIBUTE-NAME'] }}
```

Change `INPUT-ATTRIBUTE-NAME` to the value you used in the [`name` attribute on the question page](/docs/make-first-prototype/add-questions#add-a-text-input-to-question-2). For example:

```
{{ data['number-of-balls'] }}
```

### Show the answer to question 1

1. Open the `check-your-answers.html` file in your `app/views` folder.
2. Find the `<dt>` tag that contains the text `Name`.
3. Change `Name` to `Number of balls you can juggle`.
4. In the `<dd>` tag on the next line, change `Sarah Philips` to `{{ data['how-many-balls'] }}`.

You must also change `<span class="govuk-visually-hidden"> name</span>` to `<span class="govuk-visually-hidden"> number of balls you can juggle</span>`.

Screen readers will read the text in the `<span>` tags, but the text will not appear on the page.

### Show the answer to question 2

1. Find the `<dt>` tag that contains the text `Date of birth`.
2. Change `Date of birth` to `Your most impressive juggling trick`.
3. In the `<dd>` tag on the next line, change `5 January 1978` with `{{ data['most-impressive-trick'] }}`.

You must also change `<span class="govuk-visually-hidden"> date of birth</span>` to `<span class="govuk-visually-hidden"> your most impressive juggling trick</span>`.

Go to http://localhost:3000/start and answer the questions to check the answer to question 2 works.

[Next (Let the user change their answers)](let-user-change-answers)
