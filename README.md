# Express prototing tool

Prototyping tool built in [Express](http://expressjs.com/).

## Requirements

* [Node](http://nodejs.org/)
* [Npm](https://npmjs.org/) (which comes with node).
* [Grunt & Grunt-CLI](http://gruntjs.com/)
* [SASS](http://sass-lang.com/)
* [RubyGems](http://rubygems.org)

You may already have some of these. Try the following to see:

* for Node, try `node --version`
* for NPM, try `npm --version`
* for Grunt & Grunt-CLI, try `grunt --version` which should tell you the versions of both
* for RubyGems, try `gem --version`

This also assumes you have a version of Ruby on your machine (If it's a Mac, you will).

## Getting started

### Node

Get the Node installer from [http://nodejs.org/](http://nodejs.org/). This will also install NPM.

### Grunt

The `start-app.sh` file needs Grunt's Command Line Interface (CLI) to run all the tasks for the project.

You can install the CLI using this command:

    npm install -g grunt-cli

### RubyGems

You can get RubyGems from their [downloads page](http://rubygems.org/pages/download).

### SASS

To install the SASS gem use:

    gem install sass

### Everything else

Use this command to get everything else:

    npm install

## Running the app

To run the app:

    ./start-app.sh

The app recompiles app/assets/stylesheets/application.scss everytime changes are observed.
