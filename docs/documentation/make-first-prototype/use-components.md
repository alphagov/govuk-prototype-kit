# Use components from the Design System

You can copy example code from the GOV.UK Design System to add page elements like radios and text inputs - we call these ‘components’.

## HTML and Nunjucks

HTML is the language used to create web pages.

Nunjucks is another language we can run in the Prototype Kit, to make HTML for us. Short, simple Nunjucks code can create much longer, more complex HTML.

In the Design System, components have both Nunjucks and HTML example code. Either will work in the Prototype Kit.

## Add radios to question 1

1. Go to the [stacked radios](https://design-system.service.gov.uk/components/radios/#stacked-radios) section of the Design System.
2. Select the **Nunjucks** tab, then **Copy code**.
3. Open `juggling-balls.html` in your `app/views` folder.
4. Replace the 2 example `<p>...</p>` paragraphs with the code you copied.
5. The example comes with a heading that is connected to the answers for accessibility, so delete the old `<h1>` tag with "How many balls can you juggle?".

### Customise the example code

1. Under `legend`, change `text` from "Where do you live?" to "How many balls can you juggle?".
2. Change the `idPrefix` and `name` to `how-many-balls`.
3. We only want 3 options not 4, so delete the last of the `items` including the comma from the previous item:
```
    ,
    {
        value: "northern-ireland",
        text: "Northern Ireland"
    }
```
4. Change the `value` and `text` in the `items` to:
  - 3 or more
  - 1 or 2
  - None - I cannot juggle

Your component code should now look like this:

```
{{ govukRadios({
  idPrefix: "how-many-balls",
  name: "how-many-balls",
  fieldset: {
    legend: {
      text: "How many balls can you juggle?",
      isPageHeading: true,
      classes: "govuk-fieldset__legend--l"
    }
  },
  items: [
    {
      value: "3 or more",
      text: "3 or more"
    },
    {
      value: "1 or 2",
      text: "1 or 2"
    },
    {
      value: "None - I cannot juggle",
      text: "None - I cannot juggle"
    }
  ]
}) }}
```

Your page should now look like this:

![Screenshot of the question page with radios](/public/images/docs/tutorial-radios.png)

[Next (add a textarea to question 2)](use-components-2)
