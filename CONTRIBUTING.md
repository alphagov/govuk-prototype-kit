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

Checkout a new branch for the release.

Update [CHANGELOG.md](https://github.com/alphagov/govuk-prototype-kit/blob/master/CHANGELOG.md) to summarise the changes made since the last release.

To see the commits to be summarised in the changelog since the last release, [compare the latest-release branch with master](https://github.com/alphagov/govuk-prototype-kit/compare/latest-release...master).

Propose a new version number in [VERSION.txt](https://github.com/alphagov/govuk-prototype-kit/blob/master/VERSION.txt) and update line 4 in [package.json](https://github.com/alphagov/govuk-prototype-kit/blob/master/package.json#L4) with the new version number.

Open a new pull request with a single commit including the above changes.

[Here is an example for v6.1.0](https://github.com/alphagov/govuk-prototype-kit/commit/53e36d79a994ce3649b53f4008370cd75068c27c).

Once merged into master a new version will be built.
