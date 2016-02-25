## 8) Deploying different versions

We have found its helpful to have at least two different versions of a prototype online.

1. **dev** - an experimental version, where things change rapidly and may well be broken
2. **master** - a stable version, where other people can rely on seeing a working version of the prototype that you're happy with

If you've followed the instructions above, you already have a master version online.

Create a local dev branch:

`git checkout -b dev`

Add a dev heroku remote:

`heroku apps:create --remote dev [dev-name]`

Push to the dev remote:

`git push dev dev:master`

Now your dev branch will be live at [dev-name].herokuapp.com

Note that you have to add 'dev:master' this time - if you dont add this, Heroku assumes you want the master branch to be deployed.