# Using GOV.UK Notify to prototype emails and text messages

You can use GOV.UK Notify to send text messages or emails when users
interact with your prototype. For example you could send users a
confirmation email sent at the end of a journey.

## Sign up for a GOV.UK Notify account

If you have a government email address you can sign up for an account at
https://www.gov.uk/notify

You need an account before you can use GOV.UK Notify to send text
messages or emails.

## Getting an API key

An API key is like a password that lets your prototype talk to Notify.
Your prototype sends this key every time it asks Notify to do something.

To get a key:
- sign into GOV.UK Notify
- go to the ‘API integration’ page
- click ‘API keys’
- click the ‘Create an API’ button
- choose the ‘Team and whitelist’ option
- copy the key to your clipboard

### Saving your key on your computer

This will let your prototype talk to Notify while it’s running on your
computer.

To save the key on your computer, run this command in your Terminal, in
the root folder of your prototype (where xxxxxxx is a key you’ve copied
from Notify):
```shell
   echo NOTIFYAPIKEY=xxxxxxx >> .env
````   
This adds the API key to the end of your `.env` file. Your prototype
will load the key from your `.env` file.

### Saving the key on Heroku

This will let your prototype talk to Notify while it’s running on
Heroku.

To save the key on Heroku, go to the settings page of your app, click
‘Reveal config vars’ and fill in the two textboxes like this (where
xxxxxxx is the key you’ve copied from Notify):

KEY            | VALUE
---------------|----------
`NOTIFYAPIKEY` | `xxxxxxx`

### Keeping your key safe

It’s really important that you keep your key secret. If you put it in
the `.env` file it’s safe – that file isn’t published on Github. If you
do accidentally publish your key somewhere you must sign into Notify and
revoke it.

## Add the Notify code to your prototype

Add this code to the top of routes.js:

```javascript
var NotifyClient = require('notifications-node-client').NotifyClient,
    notify = new NotifyClient(process.env.NOTIFYAPIKEY);
```

`process.env.NOTIFYAPIKEY` is a special kind of variable that Node
pulls from the environment your prototype is running in.

## Sending your first email

Make a page with a form to collect the user’s email address. For
example:
```
{% from "input/macro.njk" import govukInput %}

<form class="form" method="post">

  {{ govukInput({
    label: {
      text: "Email address"
    },
    id: "emailAddress",
    name: "emailAddress"
  }) }}

  <button class="govuk-button">Continue</button>

</form>
```

Save this page as `email-address-page.html`.

Then add this code at the bottom of routes.js:

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
email addresses to the ‘whitelist’ in GOV.UK Notify. This will let you
send them emails too. You’ll need to collect their email addresses and
get consent to use them before doing your research.

## More things you can do with GOV.UK Notify

The complete documentation for using the GOV.UK Notify API is here: https://github.com/alphagov/notifications-node-client#govuk-notify-nodejs-client
