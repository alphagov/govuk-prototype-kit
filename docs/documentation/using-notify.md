---
title: Use GOV.UK Notify
---
# Use GOV.UK Notify to prototype emails and text messages

You can use GOV.UK Notify to send text messages or emails when users
interact with your prototype. For example you could send users a
confirmation email at the end of a journey.

## Sign up for a GOV.UK Notify account

You need an account before you can use GOV.UK Notify to send text messages or emails.

If you have a government email address you can [sign up for a GOV.UK Notify account](https://www.gov.uk/notify)

## Getting an API key

An API key is like a password that lets your prototype talk to Notify.
Your prototype sends this key every time it asks Notify to do something.

To get a key:
- sign into GOV.UK Notify
- go to the ‘API integration’ page
- click ‘API keys’
- click the ‘Create an API’ button
- choose the ‘Team and guest list’ option
- copy the key to your clipboard

### Saving your key on your computer

This will let your prototype talk to Notify while it’s running on your
computer.

To save the key on your computer, add this line to the end of the `.env`
file in your prototype (where `xxxxxxx` is the key you’ve copied from
Notify):
```shell
NOTIFYAPIKEY=xxxxxxx
```   
Your prototype will load the key from your `.env` file. If you don’t
have a `.env` file then run your prototype (with the `npm start`
command) and it will create one for you.

### Saving the key on Heroku

This will let your prototype talk to Notify while it’s running on
Heroku.

To save the key on Heroku, go to the settings page of your app, click
‘Reveal config vars’ and fill in the two textboxes like this (where
xxxxxxx is the key you’ve copied from Notify):
```
KEY          | VALUE
-------------|----------
NOTIFYAPIKEY | xxxxxxx
```

### Keeping your key safe

It’s really important that you keep your key secret. If you put it in
the `.env` file it’s safe – that file isn’t published on GitHub. If you
do accidentally publish your key somewhere you must sign into Notify and
revoke it.

## Add the Notify code to your prototype

Add this code to the top of routes.js:

```javascript
var NotifyClient = require('notifications-node-client').NotifyClient,
    notify = new NotifyClient(process.env.NOTIFYAPIKEY);
```

## Sending your first email

Make a page with a form to collect the user’s email address. For
example:
```
{% extends "layout.html" %}

{% block content %}

  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <form class="form" method="post">

        {{ govukInput({
          label: {
            text: "Email Address"
          },
          id: "email-address",
          name: "emailAddress",
          type: "email",
          autocomplete: "email",
          spellcheck: false
        }) }}

        {{ govukButton({
          text: "Continue"
        })}}

      </form>
    </div>
  </div>
{% endblock %}
```

Save this page as `email-address-page.html`.

Then add this code to `routes.js`, above the line that says
`module.exports = router`:

```javascript
// The URL here needs to match the URL of the page that the user is on
// when they type in their email address
router.post('/email-address-page', function (req, res) {

  notify.sendEmail(
    // this long string is the template ID, copy it from the template
    // page in GOV.UK Notify. It’s not a secret so it’s fine to put it
    // in your code.
    'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    // `emailAddress` here needs to match the name of the form field in
    // your HTML page
    req.body.emailAddress
  );

  // This is the URL the users will be redirected to once the email
  // has been sent
  res.redirect('/confirmation-page');

});
```

### Testing it out

Now when you type your email address into the page and press the green
button you should get an email. You should also be able to see the email
you’ve sent on the GOV.UK Notify dashboard.

Because your account is in trial mode you’ll only be able to send emails
to yourself. If you’re doing user research you can add the participants
email addresses to the ‘guest list’ in GOV.UK Notify. This will let you
send them emails too. You’ll need to collect their email addresses and
get consent to use them before doing your research.

## More things you can do with GOV.UK Notify

[Documentation for using the GOV.UK Notify API](https://docs.notifications.service.gov.uk/node.html)
