# Contribution guidelines

We really like contributions and bug reports, in fact the project wouldn't have got to this stage without them.
We do have a few guidelines to bear in mind.

## Community

We have two Slack channels for the Prototype kit. You'll need a government email address to join them.

* [Slack channel for users of the prototype kit](https://ukgovernmentdigital.slack.com/messages/prototype-kit/)
* [Slack channel for developers of the prototype kit](https://ukgovernmentdigital.slack.com/messages/prototype-kit-dev/)

## Raising bugs

When raising bugs please explain the issue in good detail and provide a guide to how to replicate it.
When describing the bug it's useful to follow the format:

- what you did
- what you expected to happen
- what happened

## Suggesting features

Please raise feature requests as issues before contributing any code.

This ensures they are discussed properly before any time is spent on them.

## Contributing code

### Indentation and whitespace

Your JavaScript code should pass [linting](docs/linting.md).

For anything else, maintain 2-space, soft-tabs only indentation. No trailing whitespace.

### Versioning

Follow the guidelines on [semver.org](http://semver.org/) for assigning version
numbers.

Versions should only be changed in a commit of their own, in a pull request of
their own. This alerts team members to the new version and allows for
last-minute scrutiny before the new version is released. Also, by raising a
separate pull request, we avoid version number conflicts between feature
branches.

### Commit hygiene

Please see our [git style guide](https://github.com/alphagov/styleguides/blob/master/git.md)
which describes how we prefer git history and commit messages to read.

## To release a new version

Checkout a new branch for the release.

Update [CHANGELOG.md](https://github.com/alphagov/govuk_prototype_kit/blob/master/CHANGELOG.md) to summarise the changes made since the last release.

To see the commits to be summarised in the changelog since the last release, [compare the latest-release branch with master](https://github.com/alphagov/govuk_prototype_kit/compare/latest-release...master).

Propose a new version number in [VERSION.txt](https://github.com/alphagov/govuk_prototype_kit/blob/master/VERSION.txt) and update line 4 in [package.json](https://github.com/alphagov/govuk_prototype_kit/blob/master/package.json#L4) with the new version number.

### Create the release zip

_Note - we only need to create a release zip by hand while the project is in private beta._

Copy to a new folder:

`cp -r  govuk-prototype-kit-private-beta govuk-prototype-kit-private-beta-zip`

Change to this directory:

`cd govuk-prototype-kit-private-beta-zip`

Remove the .git folder, node_modules and the old zip:

`rm -rf .git`

`rm -rf node_modules`

`rm docs/assets/downloads/govuk-prototype-kit-private-beta.zip `

Install GOV.UK Frontend:

(you'll need to be signed in to the npm account)

`npm install @govuk-frontend/frontend`

The `node_modules` folder should now contain `@govuk-frontend`

Make a zip of the `govuk-prototype-kit-private-beta-zip` folder

Rename the zip to `govuk-prototype-kit-private-beta.zip`

### Add the zip to the release

In the main project folder, (not the zip folder created above):

Copy the new zip to `docs/assets/downloads`

### Make the new release

Commit your changes and open a pull request on GitHub

Review and merge pull request

Sign into the Heroku web interface using the design-system-pipeline credentials.

Find the govuk-prototype-kit-beta app, and deploy the version.
