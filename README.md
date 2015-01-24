# Express prototyping tool

Prototyping tool built in [Express](http://expressjs.com/).

It will give you a basic Express app, with templates, css and images from the [GOV.UK front-end toolkit](https://github.com/alphagov/govuk_frontend_toolkit).


## Requirements

#### [Node](http://nodejs.org/)

You may already have it, try:

```
node --version
```

Your version needs to be at least v0.10.0.

If you don't have Node, download it here: [http://nodejs.org/](http://nodejs.org/).

## Getting started

Install Node.js (see requirements)

#### Clone this repo

```
git clone git@github.com:tombye/express_prototype.git
```

#### Install dependencies

```
npm install
```

This will install folders containing programs described by the package.json file to a folder called `node_modules`.

#### Run the app

```
node start.js
```

Go to [localhost:3000](http://localhost:3000) in your browser.

#### Hot reload

Any code changes should update in the browser without you restarting the app.

The app recompiles app/assets/stylesheets/application.scss everytime changes are observed.

## Documentation

Guides for getting set up and how to work with the prototyping application are available on this repo's [wiki](https://github.com/tombye/express_prototype/wiki).

* [Getting started](https://github.com/tombye/express_prototype/wiki/Getting-started) (Read this first)
* [Creating routes](https://github.com/tombye/express_prototype/wiki/Creating-routes)
* [Making pages](https://github.com/tombye/express_prototype/wiki/Making-pages)
* [Writing CSS](https://github.com/tombye/express_prototype/wiki/Writing-CSS)
* [Deploying (getting your work online)](https://github.com/tombye/express_prototype/wiki/Deploying-(getting-your-work-online))
* [Tips and Tricks](https://github.com/tombye/express_prototype/wiki/Tips-and-Tricks)

This project is built on top of Express, the idea is that it is straightforward to create simple static pages out of the box. However, you're not limited to that - more dynamic sites can be built with more understanding of Express. Here's a good [Express tutorial.](http://code.tutsplus.com/tutorials/introduction-to-express--net-33367)

