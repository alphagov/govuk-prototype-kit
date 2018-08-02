To set it locally, run this command in your Terminal, in the root
folder of your prototype:
```shell
   echo NOTIFYAPIKEY=xxxxxxx >> .env
````   
(where xxxxxxx is a key you’ve created in Notify). This creates a file 
named `.env` which contains your API key.

To set it on Heroku, go to the settings page on your app, click
‘reveal config vars’ and enter NOTIFYAPIKEY and the value of the key
in the two boxes.

Add this code to the top of routes.js:
```javascript
var NotifyClient = require('notifications-node-client').NotifyClient,
    notify = new NotifyClient(process.env.NOTIFYAPIKEY);
```

`process.env.NOTIFYAPIKEY` is a special kind of variable that Node
pulls from the environment your prototype is running in.

***

Make a page to collect the phone number or email address. This page
needs a textbox called 'email', to match req.body.email below, eg
<input type='text' name='email' />

You can change it to something else, eg `phoneNumber`, but you need to
change it in the code below as well.

This code goes at the bottom of routes.js:

```javascript
router.post('/page-with-email-or-phone-input', function (req, res) {

  notify.sendEmail(
    // this long string is the template ID, get it from Notify
    '24a8b897-2de9-4a9f-a2db-b6ef682f799a',
    req.body.email,
    {}
  );

  // This URL can wherever you want to send people to after the 
  // emailhas been sent
  res.redirect('/confirmation-page');

});
```
