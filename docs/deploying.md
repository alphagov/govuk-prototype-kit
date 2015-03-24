# Deploying (getting your work online)

We recommend using [Heroku](http://wwww.heroku.com) to get your prototype online. It's simple and fast to deploy new versions as you work.

### 1) If you're new to Heroku, get an account and install their toolbelt

https://toolbelt.heroku.com/

### 2) Deploy for the first time

In the folder of your prototype, run:

`heroku apps:create [name]`

[name] will be the address of your prototype online. For example if you run:

`heroku apps:create my-prototype`

Your prototype would then be available online at [http://my-prototype.herokuapp.com](#)

### 3) Deploy changes

If you make a change to your prototype, commit your changes as usual then run:

`git push heroku master`

to push your changes to Heroku

## Deploying different versions

We have found its helpful to have at least two different versions of a prototype online.

1. **dev** - an experimental version, where things change rapidly and may well be broken
2. **master** - a stable version, where other people can rely on seeing a working version of the prototype that you're happy with

If you've followed the instructions above, you already have a master version online.

Create a dev branch:

`git checkout -b dev`

Add a dev heroku remote:

`heroku apps:create --remote dev [dev-name]`

Push to the dev remote:

`git push dev dev:master`

Now your dev branch will be live at [dev-name].herokuapp.com

Note that you have to add 'dev:master' this time - if you dont add this, Heroku assumes you want the master branch to be deployed.

## Adding authentication

If you don't want the wider world to be looking at your prototype then you can add some basic username/password authentication. Only one set of credentials is supported at this time.

You just need to set some environment variables on your Heroku instance. You can do this in the Heroku admin console (under Settings ▶ Config Variables) or by running the following shell commands:

`heroku config:set NODE_ENV=production`
`heroku config:set USERNAME=username_here`
`heroku config:set PASSWORD=password_here`

Your app will now prompt you for a password when accessed on Heroku (but not when running locally).
