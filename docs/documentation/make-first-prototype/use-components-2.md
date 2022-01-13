---
title: Add a textarea to question 2
caption: Build a basic prototype
---
# Add a textarea to question 2

1. Go to the [textarea](https://design-system.service.gov.uk/components/textarea/) page of the Design System.
2. Select the **Nunjucks** tab, then **Copy code**.
3. Open `juggling-trick.html` in your `app/views` folder.
4. Replace the 2 example `<p>...</p>` paragraphs with the code you copied.
5. Delete the old `<h1>` tag with "What is your most impressive juggling trick?" (again the example code comes with an accessible heading for the question).

### Customise the example code

1. Under `label`, change `text` from "Can you provide more detail?" to "What is your most impressive juggling trick?".
2. Change the `id` and `name` to `most-impressive-trick`.
3. We don’t need a hint, so remove it and the comma just before it.

Your component code should now look like this:

```
{{ govukTextarea({
  name: "most-impressive-trick",
  id: "most-impressive-trick",
  label: {
    text: "What is your most impressive juggling trick?",
    classes: "govuk-label--l",
    isPageHeading: true
  }
}) }}
```

Your page should now look like this:

![Screenshot of the question page with a textarea](/public/images/docs/tutorial-textarea.png)

[Next (Show the user’s answers on your ‘Check answers’ page)](show-users-answers)
