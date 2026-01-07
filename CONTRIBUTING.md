# Contribution guidelines

**The GOV.UK Prototype Kit is currently maintained by the [GOV.UK Design System team](https://design-system.service.gov.uk/contact/). 

[There is only minimal support in place](https://github.com/alphagov/govuk-prototype-kit) so we cannot work on contributions at this time.**

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

Your JavaScript code should pass [linting](internal_docs/linting.md).

For anything else, maintain 2-space, soft-tabs only indentation. No trailing whitespace.

### Commit hygiene

Please see our [Git style guide in the 'How to store source code' page of the GDS Way](https://gds-way.cloudapps.digital/standards/source-code.html#commit-messages), which describes how we prefer Git history and commit messages to read.

### Review apps

When a pull request is opened, Heroku may create a [review app](https://devcenter.heroku.com/articles/github-integration-review-apps#viewing-review-apps)
that will allow you and your reviewers to preview how your changes will appear for users.
If a review app is not created automatically, you can ask someone from the
Prototype Kit team to create one.

Review apps are password protected with the username `govuk` and the password `govuk`.
