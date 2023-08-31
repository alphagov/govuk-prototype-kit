# Releasing a new version of the prototype kit

Before the release, the content designer needs to draft the release notes, based on the changelog but written to be clear for our audience.

1. Make sure the changelog in `main` branch is up-to-date.

2. Run `./scripts/prepare-release`.

3. When the script provides a Pull Request URL review it and approve when it's ready.

4. Once the script has finished checkout the *main* branch and pull the latest changes.

5. Sign in to npm (`npm login`), using the credentials for the govuk-prototype-kit npm user from Bitwarden.

6. Run `npm run clean-publish` and enter the one-time password when prompted.

7. Run `npm logout` to log out from npm.

8. Let the community know about the release

Write a brief summary with highlights from the release then send it to the following slack channels:

- X-GOV #govuk-design-system
- X-GOV #prototype-kit
- GDS #govuk-design-system
- GDS #product-and-technology

Make sure to send a link to the 'create a new prototype' page rather than the GitHub release page: https://prototype-kit.service.gov.uk/docs/create-new-prototype.

9. On the sprint board, move everything that's been released from the Ready for release column to the Done column
