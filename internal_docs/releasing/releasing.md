# Releasing a new version of the prototype kit

Before the release, the content designer needs to draft the release notes, based on the changelog but written to be clear for our audience.

1. Make sure the changelog in `main` branch is up-to-date.

2. Run `./scripts/prepare-release`.

3. When the script provides a Pull Request URL review it, approve it and merge when it's ready.

4. Let the script finish, if it fails to release it should provide instructions, if not it's worth looking back at [an older copy of the release notes for manual releasing](https://github.com/alphagov/govuk-prototype-kit/blob/v13.5.0/internal_docs/releasing/releasing.md).

5. Let the community know about the release

Write a brief summary with highlights from the release then send it to the following slack channels:

- X-GOV #govuk-design-system
- X-GOV #prototype-kit
- GDS #govuk-design-system
- GDS #product-and-technology

Make sure to send a link to the 'create a new prototype' page rather than the GitHub release page: https://prototype-kit.service.gov.uk/docs/create-new-prototype.

6. On the sprint board, move everything that's been released from the Ready for release column to the Done column
