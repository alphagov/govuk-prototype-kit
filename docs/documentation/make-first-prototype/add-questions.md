# Add questions to your question pages

Copy the code from the [GOV.UK Design System](https://design-system.service.gov.uk/) to add page elements like radios and text inputs.

## Add radios to question 1

1. Go to the [stacked radios section of the Design System](https://design-system.service.gov.uk/components/radios/#stacked-radios).
2. Select **HTML**, then select **Copy code**.
3. Open `juggling-balls.html` in your `app/views` folder.
4. Replace the 2 example `<p>...</p>` paragraphs with the HTML code you copied.
5. Remove the fourth radio option `<div>...</div>` block, because we only need 3 radio options.
6. Select the `<h1>` line you edited when you [created the page](create-pages#question-pages), then cut and paste it so it replaces the `<h1>` line in the copied code.

Replace the text in the 3 `<label>` tags with:

- `3 or more`
- `1 or 2`
- `None - I cannot juggle`

Change the value of the 3 `value` attributes so they match the text in the `label` tags.

Change all instances of `where-do-you-live` to `how-many-balls`.

1. Select **Find**, then **Find in buffer**.
2. In the **Find** field enter `where-do-you-live`.
3. In the **Replace** field enter `how-many-balls`.
4. Select **Replace all**.

Your page should now look like this:

![The 'How many balls you can juggle?' question with 4 answers: '5 or more', '3 or 4', '1 or 2' and 'None - I cannot juggle'](/public/images/docs/prototype-kit-tutorial-question-1.png)

## Add a text input to question 2

1. Go to the [textarea page of the Design System](https://design-system.service.gov.uk/components/textarea/).
2. Select **HTML**, then **Copy code**.
3. Open `juggling-trick.html` in your `app/views` folder.
4. Replace the 2 example `<p>...</p>` paragraphs with the HTML code you copied.
5. Change the value of the `name` attribute from `"more-detail"` to `"most-impressive-trick"`.
6. Select the `h1` line you edited when you [created the page](create-pages#question-pages), and cut and paste it inside the `label` tags so it replaces the `Can you provide more detail?` text.
7. Delete the `span` section above the `textarea` section.

The label is important for accessibility in a live service. You should test your prototype with users who have access needs by:

- talking to a developer on your team
- asking for advice on the [#prototype-kit channel on cross-government Slack](https://ukgovernmentdigital.slack.com/app_redirect?channel=prototype-kit)

Your page should now look like this:

![The 'What is your most impressive juggling trick?' question with a textarea](/public/images/docs/prototype-kit-tutorial-question-2.png)

[Next (Show the user's answers on your 'Check your answers' page)](show-users-answers)
