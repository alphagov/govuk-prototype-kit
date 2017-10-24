# Basic validation

<p class="lede">Basic validation can be used to check for empty fields, or where no radio or checkbox has been selected.</p>

To make it work, add `data-required` to the wrapping form-group. You can also pass an optional custom error message in by using `data-required="Custom error message"`.

#### Default error message
```html
<div class="form-group" data-required>
    <label class="form-label" for="full-name-f1">Full name</label>
    <input class="form-control" id="full-name-f1" type="text">
</div>
```

#### Custom error message

```html
<div class="form-group" data-required="Custom error message goes here">
    <label class="form-label" for="full-name-f1">Full name</label>
    <input class="form-control" id="full-name-f1" type="text">
</div>
```

You can also override the default error-summary heading and description at the top of the page by adding them onto the `<main>` tag at the top of your page.

```html
<main data-errorHeading="Custom heading" data-errorDescription="Custom desc">
```

## Default error messages

**errorHeading:**  
<span class="heading-medium error-summary-heading">There's been a problem</span>

**errorDescription:**  
Check the following:

**input fields:**
<span class="error-message">Cannot be blank</span>

**textareas:**
<span class="error-message">Cannot be blank</span>

**radios:**
<span class="error-message">Choose an option</span>

**checkboxes:**
<span class="error-message">Choose an option</span>

## Examples
- [Form validation](http://localhost:3000/docs/examples/elements/validation)