# Deploying (getting your work online)

We recommend using [Heroku](http://wwww.heroku.com) to get your prototype online. It's simple and fast to deploy new versions as you work.

### 1) If you're new to Heroku, get an account and install their toolbelt

https://toolbelt.heroku.com/

### 2) Deploy for the first time

In the folder of your prototype, run:

`heroku apps:create [name]`

[name] will be the address of your prototype online. For example if you run:

`heroku apps:create my-prototype`

Your prototype would then be available online at [http://my-prototype.herokuapp.com](#).

However, the kit won't show your prototype online without setting a username and password:

### 3) Set a username and password

You can do this in the on the Heroku website (under Settings ▶ Config Variables) or by running the following commands:

```
heroku config:set USERNAME=username_here
heroku config:set PASSWORD=password_here
```
If you don't want to have password protection on your prototype, you can set the `USE_AUTH` config var:

```
heroku config:set USE_AUTH=false
```
If you have more than one remote you'll need to add a flag to specify which remote to set.

```
heroku config:set PASSWORD=password_here -r remotename_here
```

### 4) Deploy changes

If you make a change to your prototype, commit your changes as usual then run:

`git push heroku master`

to push your changes to Heroku

## Deploying different branches

By default when you push to Heroku your master branch will be deployed. Sometimes you may want to deploy code that's on a different branch, eg a test feature.

To deploy a different branch:

`git push heroku branch_name:master`

This pushes your local branch `branch_name` on to the heroku master branch. If Heroku complains that the remote contains work you don't have, you can force push using `-f`:

`git push -f heroku branch_name:master`


## Deploying to more than one Heroku app

We have found its helpful to have at least two different versions of a prototype online.

1. **dev** - an experimental version, where things change rapidly and may well be broken.
2. **master** - a stable version, where other people can rely on seeing a working version of the prototype that you're happy with.

If you've followed the instructions above, you already have a master version online.

1. Rename your existing heroku remote to heroku-master:

`git remote rename heroku heroku-master`

2. Create a dev heroku remote:

`heroku apps:create --remote heroku-dev [dev-name]`

3. Push to the **dev** remote:

`git push heroku-dev master`

4. To push to the **master** remote:

`git push heroku-master master`

Now your work will be live at [dev-name].herokuapp.com

If you want to deploy a different branch to one of your remotes:

`git push heroku-dev branch_name:master`
