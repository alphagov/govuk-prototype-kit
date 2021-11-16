# Releasing a new version of the prototype kit

1. Checkout main and pull latest changes.

2. Decide on a new version number. Do this by looking at the [current "Unreleased" CHANGELOG](../CHANGELOG.md) changes and updating the previous release number depending on the kind of entries:

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

4. Update the version number in [VERSION.txt](/VERSION.txt) and update "version" in [package.json](/package.json#L4).

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
