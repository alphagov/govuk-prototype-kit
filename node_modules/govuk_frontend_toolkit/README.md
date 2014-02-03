This is an NPM package for [alphagov/govuk_frontend_toolkit](https://github.com/alphagov/govuk_frontend_toolkit)

To update this package with changes from the source repo:

```
git submodule update
# commit the changes to the files, don't push
npm version <version number>
git push
```

You can then publish changes to npmjs.org by running the job `npm_publish_govuk_frontend_toolkit_npm`
on Jenkins CI.

In projects using this package:

```
# bump version in package.json
npm install
```
