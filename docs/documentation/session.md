---
title: Store data in session
---
# Store data in session

**Advanced topic**

If you need to store data for each user, the best way to do it is using session data.

This means that if more than one person is using your prototype, their data will not get mixed up.

The easiest way to clear session data is to use 'Incognito mode' for each user, and close that window when you're done.

## How to use

In a route function, refer to `req.session`.

### Accessing fields from the session

For example, when submitting the following (simplified) HTML:

```html
<input name="first-name" value="Sarah">
<input name="last-name" value="Philips">
```

You'll have a `req.session.data` object in your route function:

```js
{
    'first-name': 'Sarah',
    'last-name': 'Philips'
}
```

These two field values can be accessed in JavaScript as:

```js
req.session.data['first-name']
req.session.data['last-name']
```

Or in views as:

```
{{ data['first-name'] }}
{{ data['last-name'] }}
```

### Accessing nested fields from the session

Session data can also be nested for easy grouping. For example answers from multiple family members:

```html
<input name="claimant[first-name]" value="Sarah">
<input name="claimant[last-name]" value="Philips">

<input name="partner[first-name]" value="Michael">
<input name="partner[last-name]" value="Philips">
```

You'll have a nested `req.session.data` object in your route function:

```js
{
    claimant: {
        'first-name': 'Sarah',
        'last-name': 'Philips'
    },
    partner: {
        'first-name': 'Michael',
        'last-name': 'Philips'
    }
}
```

These four field values can be accessed in your route function as:

```js
req.session.data['claimant']['first-name']
req.session.data['claimant']['last-name']
req.session.data['partner']['first-name']
req.session.data['partner']['last-name']
```

Or in views as:

```
{{ data['claimant']['first-name'] }}
{{ data['claimant']['last-name'] }}
{{ data['partner']['first-name'] }}
{{ data['partner']['last-name'] }}
```

You can see a full example here:

[https://github.com/expressjs/session#example](https://github.com/expressjs/session#example)

You can read more about Express Session here:

[https://github.com/expressjs/session](https://github.com/expressjs/session)
