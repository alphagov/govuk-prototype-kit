# Form Validation

You can add form validation to your form in the following ways

## Table of Contents
- [Form Example](#example)
- [Form Attributes](#form_attributes)
- [Input Expectations](#input_expectations)
- [Success and Failure urls](#success_and_failure_urls)
- [Error Messages](#error_messages)
- [Sticky Forms](#sticky_forms)


<a name="example">
### Example
A full example of form validation can be seen by going to [http://localhost:3000/examples/elements/form-validation](http://localhost:3000/examples/elements/form-validation)
in your browser.

<a name="form_attributes">
### Form Attributes
To add the form validation functionality to your form add the action `/answer-question` to your form and the Method `post`

```html
<form action="/answer-question" method="post" class="form">
```

<a name="input_expectations">
### Input expectations
To set up specific validation for your form fields you associate a hidden expectation input. This is done by adding a hidden
`expected` input using the `name` value of the field you wish to be validated and appending `:expected` to this `name` attribute.
You then place the "expected" answer in the `value` attribute of the `expected` input.
>The `expected` input value can be a Regular expression or a String.  
>It is advised to group the expected inputs together at the bottom of the form.

#### Field to be validated:
```html
<input type="text" id="full-name" name="full_name"/>
```

#### Fields expectation:
```html
<input type="hidden" name="full_name:expected" value="1234"/>
```

#### Fields expectation (Regular expression example):
> A regular expression requiring the answer to be digits between 1 and 9 characters long.

```html
<input type="hidden" name="full_name:expected" value="(\d+){1,9}"/>
```

<a name="success_and_failure_urls">
### Success and Failure urls
When your form is submitted it will either be successful or it will contain errors. You can control where you wish your form
to go to by adding the hidden redirect inputs.
>It is advised to group the redirect url inputs with the expected inputs at the bottom of the form.

#### Success redirect
```html
<input type="hidden" name="success_redirect" value="/success"/>
```

#### Failure redirect
```html
<input type="hidden" name="failure_redirect" value="/current-page"/>
```


<a name="error_messages">
### Error Messages
To display error messages on your form pages the form validation helper gives you an `errors` variable to consume in your template.

#### Global errors
If you wish to detect if your form has errors, for instance for a global error display at the top of the form you can do the following.

```handlebars
    {{#errors}}
    <div class="error-summary" role="group" aria-labelledby="error-summary-heading-example-1"
         tabindex="-1">
      <h1 class="heading-medium error-summary-heading" id="error-summary-heading-example-1">
        Message to alert the user to a problem goes here
      </h1>
      <p>
        Optional description of the error(s) and how to correct them
      </p>
      <ul class="error-summary-list">
        {{#errors.full_name}}
        <li><a href="#full-name-details">Please enter your full name</a></li>
        {{/errors.full_name}}
      </ul>
    </div>
    {{/errors}}
```

#### Inline errors
If you wish to display inline errors you can do the following.
>The specific error is based upon the original fields name attribute

```handlebars
{{#errors.full_name}}
<span class="error-message">Please enter a valid National Insurance number</span>
{{/errors.full_name}}
```

#### Using errors variable with custom route
If you have your own route to be able to get the `errors` variable you can use the form validation middleware available on the
`req` object.

```javascript
var errors = req.form.getErrors();
```

<a name="sticky_forms">
### Sticky Forms
If you wish to have "sticky" forms the form validation helper also gives you a `formData` variable to consume in your template.
This works with text input examples, for it to work with `radio` or `checkbox` inputs or with JavaScript reveals you will
need to write a little more logic.

#### Retaining the value of a submitted text input
```handlebars
<input type="text" id="full-name" name="full_name"{{#formData.full_name}}
       value="{{formData.full_name}}"{{/formData.full_name}}>
```

#### Using formData variable with custom route
If you have your own route to be able to get the `getData` variable you can use the form validation middleware available on the
`req` object.

```javascript
var errors = req.form.getData();
```
