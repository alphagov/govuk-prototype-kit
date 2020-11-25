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
