# GOV.UK Prototype kit




**Version 2.0.0 update:** the latest version of the kit (2.0.0) is not compatible with previous versions. If you update your old prototypes you'll need to [convert them as well](https://github.com/alphagov/govuk_prototype_kit/blob/master/docs/updating-the-kit.md).



## About the prototype kit

The prototype kit provides a simple way to make interactive prototypes that look like pages on GOV.UK. These prototypes can be used to show ideas to people you work with, and to do user research.

It's built on the [Express](http://expressjs.com/) framework, and uses these GOV.UK resources:

- [GOV.UK template](https://github.com/alphagov/govuk_template)
- [GOV.UK front end toolkit](https://github.com/alphagov/govuk_frontend_toolkit)
- [GOV.UK elements](https://github.com/alphagov/govuk_elements)

Read the [project principles](docs/principles.md).

_The prototype kit is designed specifically for prototyping. It should not be used to build production systems._

## Requirements

#### [Node](http://nodejs.org/)

You may already have it, try:

```
node --version
```

Your version should be 4.2.2.

If you don't have Node, download it here: [http://nodejs.org/](http://nodejs.org/).

## Getting started

Install Node.js (see requirements).

#### Download the prototype kit

**[Download v2.0.0 of the kit](https://github.com/alphagov/govuk_prototype_kit/archive/v2.0.0.zip)**

Unzip the file.

#### Install dependencies

Open a command line app (Terminal on OSX) and change to the unzipped directory. Then run:

```
npm install
```

This will install extra code that the prototype kit needs.

#### Run the app

```
npm start
```

Go to [localhost:3000](http://localhost:3000) in your browser.

If you want to view multiple prototypes at the same time you can give them unique port numbers, like this:

```
PORT=3005 npm start
```

To avoid conflicts we recommend using ports between 3000 and 3009. To change the port number permanently, edit the port variable in /server.js.

#### Hot reload

Any code changes should update in the browser without you restarting the app.

The app recompiles app/assets/stylesheets/application.scss everytime changes are observed.

## Documentation

- [Prototype kit principles](docs/principles.md)
- [Getting started](docs/getting-started.md)
- [Making pages](docs/making-pages.md)
- [Writing CSS](docs/writing-css.md)
- [Deploying (getting your work online)](docs/deploying.md)
- [Updating the kit to the latest version](docs/updating-the-kit.md)
- [Tips and tricks](docs/tips-and-tricks.md)
- [Creating routes (server-side programming)](docs/creating-routes.md)

This project is built on top of Express, the idea is that it is straightforward to create simple static pages out of the box. However, you're not limited to that - more dynamic sites can be built with more understanding of Express. Here's a good [Express tutorial.](http://code.tutsplus.com/tutorials/introduction-to-express--net-33367)

## Community

We have two Slack channels for this app. You'll need a government email address to join them.

* [Slack channel for users of the prototype kit](https://ukgovernmentdigital.slack.com/messages/prototype-kit/)
* [Slack channel for developers of the prototype kit](https://ukgovernmentdigital.slack.com/messages/prototype-kit-dev/)
