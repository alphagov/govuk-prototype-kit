const { outdent } = require('outdent')

module.exports = {
  githubRepository: 'alphagov/govuk-prototype-kit',
  prereleaseWarning (stableReleaseVersion) {
    return outdent`
        > [!WARNING]
        > This is a prerelease. Do not publish prototypes using this version.
        > Use this release to prepare for the changes coming in version \`${stableReleaseVersion}\`.
        `
  },
  prereleaseInstallationInstructions (newVersion) {
    return outdent`
        To install this version in an existing prototype:
        
        - navigate to your prototype folder in a terminal and run the command: \`npm install govuk-prototype-kit@${newVersion}\`,
        
        To create new prototypes with this version:
        
        1. Create a new folder for your prototype in a terminal.
        2. Navigate to your prototype folder.',
        3. Run the command \`npx govuk-prototype-kit@${newVersion} create --version ${newVersion}\`.
        `
  },
  installationInstructions () {
    return 'You can find [how to update to the latest version](https://prototype-kit.service.gov.uk/update-to-latest-version/) in our documentation.'
  },
  prAttribution({actor, runId}) {
    return `Pull request generated on behalf of @${actor} by ` + 
    `[run ${runId}](https://github.com/${this.githubRepository}/actions/runs/${runId}) ` +
    `of the [Build release workflow](https://github.com/${this.githubRepository}/actions/workflows/build-release.yml)`
  }
}
