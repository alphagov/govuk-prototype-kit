# Publishing on the web (Heroku)

We recommend using [Heroku](http://www.heroku.com) to get your prototype online. It’s simple and fast to deploy new versions as you work.

Once your prototype is on Heroku, other people will be able to access and try your prototype from their own computers or mobile devices.

> **DO NOT** enter real user data in to prototypes hosted on Heroku. If your prototype stores or collects user data, talk to a security professional about appropriate security steps you must take.

A prototype deployed on Heroku is called an `app` - it will have a url like:
`your-prototype.herokuapp.com`.

You can have multiple apps running on Heroku - projects often have several so they can try different ideas out at once.

## 1) Set up Git
You need to [set up Git](setting-up-git) on your prototype before you can use Heroku.

## 2) Sign up to Heroku

If you’re new to Heroku, [sign up for a free account](https://signup.heroku.com/). When asked what language you use, select `node.js`.

## 3) Install the Heroku toolbelt

Install the [Heroku toolbelt](https://toolbelt.heroku.com/).

> On Windows, after downloading the toolbelt you'll need to run `heroku login` using the `cmd` app, as it does not work in Git Bash. Once you've logged in, you can return to using Git Bash.

The toolbelt lets you use Heroku through the terminal. You will need to restart the terminal after installing the toolbelt.

## 4) Choose a name for your app
Think of a name for your app. You need to choose a name that's unique. The name is used in the url for your prototype. For example the name:

`govuk-payments-prototype`

will create an app at:

`govuk-payments-prototype.herokuapp.com`.

## 5) Create a Heroku app

In the terminal, go to the folder of your prototype and run:

```
heroku apps:create [name of your app] --region eu
```
Replace `[name of your app]` with your app name from step 4.

## 6) Set a username and password

Prototypes made with the kit require a username and password when published online. This stops members of the public coming across your prototype by accident.

### To set username and password:

```
heroku config:set USERNAME=username_here
heroku config:set PASSWORD=password_here
```

## 7) Deploy your work

Make sure any changes you've made to your prototype have been committed to git.

From your prototype folder:
```
git push heroku master
```
This will push your work to Heroku. Deploying may take a minute or so.

## 8) View your prototype on the web

After your work is deployed, you will be able to view it on the web by visiting `[name].herokuapp.com`.
You can run `heroku open` to open your prototype in a browser.

> Heroku puts apps to sleep that haven’t been accessed in a while - so if you’ve not visited your prototype for a while it may take a few seconds to open.
