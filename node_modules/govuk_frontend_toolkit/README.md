# GOV.UK Frontend Toolkit

This is an NPM package for [alphagov/govuk_frontend_toolkit](https://github.com/alphagov/govuk_frontend_toolkit)

## Installing

Include `govuk_frontend_toolkit` in your `package.json` along with a version, and run:

```
npm install
```

## Managing this package

### Set up

Checkout this repo and run:

```
git submodule init
```

### Updating

Follow the [contribution guidelines](https://github.com/alphagov/govuk_frontend_toolkit_npm/blob/master/CONTRIBUTING.md).

To update this package, update the submodule:

```
git submodule init
git submodule update
cd govuk_frontend_toolkit
git pull origin master
cd ..
```

Then update the version in `package.json` and commit the result.

In your commit message, briefly summarise the changes since the last npm version. Then:

```
git push origin master
```

The job to publish an updated version to npmjs.org will run automatically when master is updated.
