const semver = require('semver')

const {versionIsAPrerelease, getPrereleaseIdentifier } = require('./changelog-release-helper.js');

class VersionBump {
  constructor(newVersion, previousVersion) {
    this.newVersion = validateVersionNumber(newVersion)
    this.previousVersion = validateVersionNumber(previousVersion)
    this.toPrerelease = versionIsAPrerelease(this.newVersion);
    
    if (this.toPrerelease) {
      const identifier = getPrereleaseIdentifier(this.newVersion)

      this.needsChangelogUpdate = identifier === 'internal'
    }

    this.versionDiff = semver.diff(this.newVersion, this.previousVersion)

    if (!this.versionDiff) {
      throw new Error(`New version (${this.newVersion}) and previous version (${this.previousVersion}) are the same`)
    }
  }

  get releaseLabel() {
    let rewordedIncType = this.versionDiff

    // If there's a prerelease flag e.g. 1.0.0-beta.0 use that to decide
    const prereleaseIdentifier = getPrereleaseIdentifier(this.newVersion)
    if (prereleaseIdentifier) {
      if (prereleaseIdentifier === 'rc') {
        return 'release candidate'
      }
      rewordedIncType = prereleaseIdentifier
    } else if (incType === 'major') {
      rewordedIncType = 'breaking'
    } else if (incType === 'minor') {
      rewordedIncType = 'feature'
    } else if (incType === 'patch') {
      rewordedIncType = 'fix'
    }

    return `${rewordedIncType} release`
  }

  get withoutPrereleaseTag() {  
    const parsedVersion = semver.parse(this.newVersion)
    parsedVersion.prerelease = []
    return parsedVersion.format()
  }
}

/**
 * Validates the version number that it is a semantic versioned string.
 *
 * @param {string} version - version number
 * @returns {string} - Validated semver of version
 */
function validateVersionNumber (version) {
  const validatedVersion = semver.valid(version)

  if (!validatedVersion) {
    throw new Error(
      `Version number "${version}" could not be parsed as a semantic versioned string.`
    )
  }

  return validatedVersion
}

module.exports = {
    VersionBump
}