# Contribution guidelines

We really like contributions and bug reports, in fact the project wouldn't have got to this stage without them.
We do have a few guidelines to bear in mind.

## Contributing

If you’ve got an idea or suggestion you can:

* email [govuk-design-system-support@digital.cabinet-office.gov.uk](mailto:govuk-design-system-support@digital.cabinet-office.gov.uk)
* [get in touch on developer Slack channel](https://ukgovernmentdigital.slack.com/messages/prototype-kit-dev)([open in app](slack://channel?team=T04V6EBTR&amp;id=C0E1063DW))
* [create a GitHub issue](https://github.com/alphagov/govuk-prototype-kit/issues)

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

1. Checkout master and pull latest changes.

2. Decide on a new version number. Do this by looking at the [current "Unreleased" CHANGELOG](../../CHANGELOG.md) changes and updating the previous release number depending on the kind of entries:

When you fix a bug and your code stays backwards compatible, increase the patch component:

```
v0.0.3 // Before bugfix
v0.0.4 // After bugfix
```

When you add functionality and your code stays backwards compatible, increase the minor component and reset the patch component to zero:

```
v0.2.4 // Before addition of new functionality
v0.3.0 // After addition of new functionality
```

When you implement changes and your code becomes backwards incompatible, increase the major component and reset the minor and patch components to zero:

```
v7.3.5 // Before implementing backwards incompatible changes
v8.0.0 // After implementing backwards incompatible changes
```

(From [jvandemo.com](https://www.jvandemo.com/a-simple-guide-to-semantic-versioning/))

3. Checkout a new branch called release-[new version number].

4. Update the version number in [VERSION.txt](https://github.com/alphagov/govuk-prototype-kit/blob/master/VERSION.txt) and update "version" in [package.json](https://github.com/alphagov/govuk-prototype-kit/blob/master/package.json#L4).

5. Commit your changes and open a new pull request on GitHub - copy the relevant Changelog section into the description.

6. Once someone has merged the pull request, [draft a new release on GitHub](https://github.com/alphagov/govuk-prototype-kit/releases)

7. In Tag version and Release title, put v[version number], for example `v7.0.0`.

8. In description, paste the relevant section from the Changelog.

9. Click 'Publish release'.

10. Let the community know about the release

Write a brief summary with highlights from the release then send it to the following slack channels:

- X-GOV #govuk-design-system
- X-GOV #prototype-kit
- GDS #govuk-design-system

Make sure to send a link to the install page rather than the GitHub release page: https://govuk-prototype-kit.herokuapp.com/docs/install.
