# Interactivity

Prototypes should be simple, and use simple hardcoded data where possible, however sometimes it helps to use a few mirrors and a little smoke to fake a more sophisticated backend can make for a more engaging and interesting demonstration.

## Form values

If a form is submitted to a route, the prototype kit will automatically store all of the named fields in the form and then show the page associated with that URI.

For example, given the following in `views/index.html`:

```html
<form action="/extras" method="POST">
  <div class="form-group">
    <label for="radio-1"><input id="radio-1" type="radio" name="order" value="Sausage, egg and chips" checked="true"></input>Sausage, egg and chips</label>
    <label for="radio-2"><input id="radio-2" type="radio" name="order" value="Bacon roll"></input>Bacon roll</label>
    <label for="radio-3"><input id="radio-3" type="radio" name="order" value="Jam and Toast"></input>Jam and toast</label>
  </div>
  <button class="button">Order up!</button>
</form>
```

From then on, all of the submitted values will be available inside [the other pages](making-pages) in the application. So all you need to add is `views/extras.html`:

```html
<h2>Choose extras for your {{order}}</h2>
```

And you can reflect the users choices.

## Clearing stored values

Choices will be overridden automatically if the user goes through the same page twice, but it may be useful to automatically clear them occasionally. That can be done in [routes.js](../app/routes.js) like so:

```javascript
var user_data = require(__dirname + '../lib/user_data.js');
// ...

app.get('/reset', function (req, res) {
  user_data.clear(req, res);
  res.render('index');
});

```

## Custom rendering

If you need to change the way that something the user has entered has been displayed, it may be worth considering whether this idea is out of scope for a prototype, or could be worked around some other way.

If you still need to, and are comfortable enough with javascript to be able to describe how to do the modification, you can add a new mapping to the [presenters](../app/presenters.js) object.

Given the following in `views/confirm.html`

```html
<form action="/checkout" method="POST">
  <label for="amount" class='form-label'><input type="number" id="amount" name="amount"></input> pennies</label>
</form>
```

You can add a presenter for amount like this:

```javascript
presenters = {
  "amount" : function (amount) { return "£" + amount / 100 }
}
```

And in `views/checkout.html`, you can display the amount in pounds back to the user:

```html
  <p>You paid {{amount}}.</p>
```
