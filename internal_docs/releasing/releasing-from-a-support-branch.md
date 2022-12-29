# Releasing from a support branch

This document is for Prototype team developers who need to publish a support branch of the GOV.UK Prototype Kit. For example, you might need to release a fix as part of a:

- patch release, after the team has started to merge changes for a new feature release into the `main` branch - for example, a 13.14.x release once we've started merging changes for 13.15.0
- release, after the team has started to merge changes for a new breaking release into the `main` branch - for example, a 12.x.x release once we've started merging changes for 13.0.0
- release for a previous major version - for example, a 12.x.x release after we've released 13.0.0

If you want to publish the `main` branch for the Prototype Kit, [follow the steps in releasing a new version of the Prototype Kit](./releasing.md).

If the `main` branch only has a few unreleasable changes, you can temporarily revert these changes.

1. Revert the unreleasable changes on the `main` branch.
2. Publish the Prototype Kit.
3. Add the reverted changes back into the `main` branch.

However, this approach has risks. For example, it creates a messy commit history on the `main` branch.

## Before you release

1. Draft release notes in a Google Doc.

## Release a new version of the Prototype Kit from the support branch

### Change the code

1. Find out which major version this release will be targeting, for example, if you're releasing v12.x.x, the major version is version 12. To check out the support branch for that major version, run `git checkout support/<MAJOR VERSION NUMBER>.x`. If the branch does not exist, follow these steps to create it:

    - make sure you have all tags locally by running `git fetch --all --tags --prune`
    - run `git checkout tags/v<LAST RELEASED VERSION NUMBER> -b support/<CURRENT MAJOR VERSION NUMBER>.x` - for example, `git checkout tags/v12.1.1 -b support/12.x`

2. Run `nvm use` to make sure you’re using the right version of Node.js and npm.

3. Push the support branch to GitHub. The branch will automatically have branch protection rules applied.

4. Create a new branch for your code changes (for example, `git checkout -b fix-the-thing`) from the `support/<MAJOR VERSION NUMBER>.x` branch.

5. Run `npm install` to make sure you have the latest dependencies installed.

6. Make your code changes, and test them following our [standard testing requirements](/docs/contributing/testing.md).

7. Update the changelog with details of the fix.

8. Commit your changes, then push your new branch (see step 4) to GitHub and raise a pull request, with `support/<MAJOR VERSION NUMBER>.x` as the base branch to merge into.

9. Once a developer approves the pull request, merge it into `support/<MAJOR VERSION NUMBER>.x`. It’s usually a developer who reviews the pull request, but sometimes pull requests need an extra review from another role. For example, if the pull request involves a content change, you may need a review from a content designer.

### Build a new release

1. Check out `support/<MAJOR VERSION NUMBER>.x`.

2. Create and check out a new branch, `support-release-[version-number]`. The version number of the new release depends on the type of release. New features correspond to a minor (X.1.X) change - for example, '12.1.0 (Feature release)'. Fixes correspond to a patch (X.X.1) change - for example, '12.1.1 (Fix release)'. In either case, refer to the previous release of that kind, and give the new release the logical next number.

3. Run `nvm use` to make sure you’re using the right version of Node.js and npm.

4. Run `npm install` to make sure you have the latest dependencies installed.

5. Update the [CHANGELOG.md](/CHANGELOG.md) by:

  - changing the 'Unreleased' heading to the new version-number and release-type - for example, '12.0.1 (Fix release)'
  - adding a new 'Unreleased' heading above the new version-number and release-type, so users will know where to add PRs to the changelog

6. Update the version number in [VERSION.txt](/VERSION.txt) and update "version" in [package.json](/package.json#L4).

7. Run `npm install` to update `npm-shrinkwrap.json`.

8. Update `VERSION` in [update.sh](/update.sh#L5) (if it is present).

9. Commit your changeds and open a new pull request, with `support/<MAJOR VERSION NUMBER>.x` as the base branch to merge into. Copy the relevant Changelog section into the description.

10. Once a developer approves the pull request, merge it into `support/<MAJOR VERSION NUMBER>.x`.

### Publish the release to GitHub

1. [Draft a new release on GitHub](https://github.com/alphagov/govuk-prototype-kit/releases) with the target `support/<MAJOR VERSION NUMBER>.x`.

2. In Tag version and Release title, put v[version-number], for example `v12.2.0`.

3. In the description, paste the relevant section from the release notes in the Google Doc.

4. Check out the `support/<MAJOR VERSION NUMBER>.x` branch and pull the latest changes.

5. Sign in to npm (`npm login`), using the credentials for the govuk-prototype-kit npm user from Bitwarden.

6. Run `npm publish --tag latest-<MAJOR VERSION NUMBER>` and enter the one-time password when prompted.

7. Run `npm logout` to log out from npm.

8. Click 'Publish release'.

## After you publish the new release

1. Let the community know about the release.

Write a brief summary with highlights from the release then send it to the following slack channels:

- X-GOV #govuk-design-system
- X-GOV #prototype-kit
- GDS #govuk-design-system

Include a link to the install page: https://prototype-kit.service.gov.uk/docs/install.

Include a link to the GitHub release page if there are actions for users that are not covered in the release notes.

2. On the [GOV.UK Prototype team Sprintboard](https://github.com/orgs/alphagov/projects/15):

    - move any relevant issues from the 'Ready to Release' column to 'Done'
    - close any associated milestones

## Update the `main` branch (optional)

1. Check out the `main` branch and pull the latest changes.

2. Run `nvm use` and `npm install` to make sure you have the latest dependencies installed.

3. Make the same changes as in the patch fix pull request, and test them using our [standard testing requirements](/docs/contributing/testing.md). Remember that `main` will contain changes the support branch did not have, which might affect the code changes you’ll need to make.

4. Also update the [CHANGELOG.md](/CHANGELOG.md) with this change. Add a new ‘Unreleased’ heading above the change, so people raising new pull requests know where to add them in the changelog. Remember that the pull request links in the changelog notes will need to link to the pull requests against the `main` branch.

5. Commit your changes.

6. Push your branch to GitHub and raise a pull request, with `main` as the base branch to merge into.

7. Once a developer approves the pull request, merge it into the `main` branch.
