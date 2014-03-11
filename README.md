# Express prototyping tool

Prototyping tool built in [Express](http://expressjs.com/).

It will give you a basic Express app, with templates, css and images from the [GOV.UK front-end toolkit](https://github.com/alphagov/govuk_frontend_toolkit).


## Requirements

* [Node](http://nodejs.org/)

You may already have it, try:

```
node --version
```

## Getting started

* Clone this repo.

* If you don't have Node, download it here: [http://nodejs.org/](http://nodejs.org/).

* Run the app:


```
node start.js
```

* Go to [localhost:3000](http://localhost:3000) in your browser.

### Hot reload

Any code changes should update in the browser without you restarting the app.

The app recompiles app/assets/stylesheets/application.scss everytime changes are observed.

## Documentation

Guides for getting set up and how to work with the prototyping application are available on this repo's [wiki](https://github.com/tombye/express_prototype/wiki).

## Disclaimer

This app uses the [lib-sass](https://github.com/hcatlin/libsass) implementation of Sass to compile its CSS. It's still a work in progress so is missing a few features.

The one that may effect you is the lack of support for [@extend](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#extend). This means the you can't use [@extend %contain-floats](https://github.com/alphagov/govuk_frontend_toolkit/blob/master/stylesheets/_shims.scss#L45) from the toolkit.

This is explained in more detail [on the wiki](https://github.com/tombye/express_prototype/wiki/Writing-CSS#wiki-we-use-node-sass).
