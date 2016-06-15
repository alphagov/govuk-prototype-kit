# Storing data in session

**Advanced topic**

If you need to store data for each user, the best way to do it is using session data.

This means that if more than one person is using your prototype, their data will not get mixed up.

The easiest way to clear session data is to use 'Incognito mode' for each user, and close that window when you're done.

## How to use

In a route function, refer to `req.session`.

For example you might have `req.session.over18` or `req.session.firstName`.

You can see a full example here:

[https://github.com/expressjs/session#example](https://github.com/expressjs/session#example)

You can read more about Express Session here:

[https://github.com/expressjs/session](https://github.com/expressjs/session)