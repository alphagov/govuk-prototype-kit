# Let the user change their answers

## Make the ‘Change’ links work

Make the **Change** links on the ‘Check your answers’ page work by adding the right links.

1. In the `<a>` tag under `{{ data['how-many-balls'] }}`, change the href attribute from `#` to `/juggling-balls`
2. In the `<a>` tag under `{{ data['most-impressive-trick'] }}`, change the href attribute from `#` to `/juggling-trick`

If you select a **Change** link, you’ll go back to the right question page, but your answer will not appear yet.

## Show the user’s answer in question 1

Radios and checkboxes have a `checked` option to set whether they are selected (checked) or not when the page loads.

Open the `juggling-balls.html` file in your `app/views` folder.

For each of the `items`, we’ll add a `checked` value, like this:

```
    {
        value: "3 or more",
        text: "3 or more",
        checked: checked("how-many-balls", "3 or more")
    },
    {
        value: "1 or 2",
        text: "1 or 2",
        checked: checked("how-many-balls", "1 or 2")
    },
    {
        value: "None - I cannot juggle",
        text: "None - I cannot juggle",
        checked: checked("how-many-balls", "None - I cannot juggle")
    }
```
In each case make sure the spelling is exactly the same as the `value`.

Go to [http://localhost:3000/juggling-balls](http://localhost:3000/juggling-balls) and check the journey works by selecting an answer, continuing to the next page, then going back.

## Show the user’s answer in question 2

Text inputs and textareas have a `value` to set what text appears in them when the page loads.

Open the `juggling-trick.html` file in your `app/views` folder.

Add `value: data['most-impressive-trick']` like this:

```
{{ govukTextarea({
    name: "most-impressive-trick",
    id: "most-impressive-trick",
    label: {
        text: "What is your most impressive juggling trick?",
        classes: "govuk-label--l",
        isPageHeading: true
    },
    value: data['most-impressive-trick']
}) }}
```

Go to [http://localhost:3000/juggling-trick](http://localhost:3000/juggling-trick) and check it works by filling in an answer, continuing to the next page, going back, then refreshing your browser.

[Next (Show different pages depending on user input - branching)](branching)
