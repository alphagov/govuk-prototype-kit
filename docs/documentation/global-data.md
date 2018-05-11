# Storing global data

You can store data globally for use across your app. Unlike session data, global data is shared by all users of your app. This can be useful for things that are repeated in your app such as service name or contact details.

Keep data you want to store globally in:

`/app/data/global-data.js`

Items in this file are imported in to the kit and made available to your views and routes.

> Never store user data to global data.

## How to use

### Using global data in views

Global data is available in the `globalData` object.

You can use a value from global data like this:

`{{ globalData['item'] }}`

### Using global data in routes

Global data is stored in `app.locals`.

You can use a value from global data like this:

`var item = req.app.locals.globalData['item']`

### Writing to global data

#### Storing persistently
Items you want to store persistently should be added to `/app/data/global-data.js`.

#### Storing non persistently
Items written to the `globalData` object are available to all users of the app whilst it runs. They will be reset when the app stops or restarts.