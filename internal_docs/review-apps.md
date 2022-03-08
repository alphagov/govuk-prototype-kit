# Review apps for pull requests

This repo uses [Heroku review apps](https://devcenter.heroku.com/articles/github-integration-review-apps)
to give reviewers a way to easily preview and test changes to the kit.

If a contributor opens a pull request from a fork of this repo (typical if the
contributor is not part of the alphagov organisation) then the review app will
not be created automatically. However, you can create a review app manually
from the Heroku dashboard.

Previews of pull requests are automatically published to a URL which has the
prefix `govuk-prototype-kit` followed by the identifier number of the pull request.

For example, pull request #137 would be deployed to `govuk-prototype-kit-pr-137.herokuapp.com`.

As Heroku builds and deploys the review app, it will create a GitHub deployment
with the @govuk-design-system-ci user. The deployment will appear both as an
event in the PR timeline, and as an active deployment in the deployment status
above the PR status checks. Once the review app has been deployed, a button
linking to the review app will become active.

## Configuration

The configuration of this repo's review apps is maintained in the Design
System Heroku account. You can find the credentials for this account in the
[team credential store](https://github.com/alphagov/design-system-team-credentials/tree/main/heroku).
