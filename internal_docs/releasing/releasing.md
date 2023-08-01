# Releasing a new version of the prototype kit

Before the release, the content designer needs to draft the release notes, based on the changelog but written to be clear for our audience.

1. Make sure the changelog in `main` branch is up-to-date.

2. Run `./scripts/prepare-release`.

3. Once someone has merged the pull request, [draft a new release on GitHub](https://github.com/alphagov/govuk-prototype-kit/releases)

4. In Tag version and Release title, put v[version number], for example `v7.0.0`.

5. In the description, paste the relevant section from the release notes.

6. Checkout the *main* branch and pull the latest changes.

7. Sign in to npm (`npm login`), using the credentials for the govuk-prototype-kit npm user from Bitwarden.

8. Run `npm run clean-publish` and enter the one-time password when prompted.

9. Run `npm logout` to log out from npm.

10. On GitHub, click 'Publish release'.

11. Let the community know about the release

Write a brief summary with highlights from the release then send it to the following slack channels:

- X-GOV #govuk-design-system
- X-GOV #prototype-kit
- GDS #govuk-design-system
- GDS #product-and-technology

Make sure to send a link to the 'create a new prototype' page rather than the GitHub release page: https://prototype-kit.service.gov.uk/docs/create-new-prototype.

12. On the sprint board, move everything that's been released from the Ready for release column to the Done column
