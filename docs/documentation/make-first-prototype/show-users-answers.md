# Show the user’s answers on the ‘Check your answers’ page

The Prototype Kit stores answers that users enter. This means you can make more realistic prototypes, for example by showing answers for users to check.

## Show the answer to question 1

1. Open `check-your-answers.html` in your `app/views` folder.
2. Find the `<dt>` tag that contains the text 'Name'.
3. Change 'Name' to 'Number of balls you can juggle'.
4. In the `<dd>` tag on the next line, change 'Sarah Philips' to `{{ data['how-many-balls'] }}`.

This is how we show data a user has entered – 'how-many-balls' is the `name` attribute from the `<input>` on the question page.

Update the screen reader text – change this
```
<span class="govuk-visually-hidden"> name</span>
```
to
```
<span class="govuk-visually-hidden"> number of balls you can juggle</span>
```

Screen readers will read this out but it will not appear on the page. Without this hidden text, screen reader users would just hear “Change” and not know what it’s for.

## Show the answer to question 2

1. Find the `<dt>` tag that contains the text 'Date of birth'.
2. Change 'Date of birth' to 'Your most impressive juggling trick'.
3. In the `<dd>` tag on the next line, change '5 January 1978' to `{{ data['most-impressive-trick'] }}`.

Change
```
<span class="govuk-visually-hidden"> date of birth</span>
```
to
```
<span class="govuk-visually-hidden"> your most impressive juggling trick</span>
```
Go to http://localhost:3000/start and answer the questions to check your answers show up correctly.

## Delete the remaining example answers

On the ‘Check your answers’ template page, there are example answers that you do not need.

1. Find and delete the whole `<div>` that starts with `<div class="govuk-summary-list__row">` and contains 'Contact information'.

2. Find and delete the whole `<div>` that starts with `<div class="govuk-summary-list__row">` and contains 'Contact details'.

3. Delete everything from the line that contains 'Application details' down to the line before 'Now send your application'.


Your code should now look like this:

```
<div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds-from-desktop">

      <h1 class="govuk-heading-xl">Check your answers before sending your application</h1>

      <h2 class="govuk-heading-m">Personal details</h2>

      <dl class="govuk-summary-list govuk-!-margin-bottom-9">
        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">
            Number of balls you can juggle
          </dt>
          <dd class="govuk-summary-list__value">
            {{ data['how-many-balls'] }}
          </dd>
          <dd class="govuk-summary-list__actions">
            <a href="#">
              Change
              <span class="govuk-visually-hidden">  number of balls you can juggle</span>
            </a>
          </dd>
        </div>
        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">
            Your most impressive juggling trick
          </dt>
          <dd class="govuk-summary-list__value">
            {{ data['most-impressive-trick'] }}
          </dd>
          <dd class="govuk-summary-list__actions">
            <a href="#">
              Change
              <span class="govuk-visually-hidden"> your most impressive juggling trick</span>
            </a>
          </dd>
        </div>
      </dl>

      <h2 class="govuk-heading-m">Now send your application</h2>

      <p>By submitting this notification you are confirming that, to the best of your knowledge, the details you are providing are correct.</p>

      <form action="/confirmation" method="post" novalidate>

        <input type="hidden" name="answers-checked" value="true">

        <button type="submit" class="govuk-button" data-module="govuk-button">
          Accept and send
        </button>

      </form>

    </div>
</div>
```

[Next (Let the user change their answers)](let-user-change-answers)
