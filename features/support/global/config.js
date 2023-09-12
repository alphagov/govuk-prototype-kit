const os = require('os')
const verboseLogging = process.env.GPK_CUKE_VERBOSE === 'true'
const shortTimeout = Number(process.env.GPK_CUKE_SHORT_TIMEOUT || '3000')
const mediumTimeout = Number(process.env.GPK_CUKE_MEDIUM_TIMEOUT || '10000')
const longTimeout = Number(process.env.GPK_CUKE_LONG_TIMEOUT || '60000')
const fnRetries = Number(process.env.GPK_CUKE_FN_RETRIES || '10')
const fnRetryDelay = Number(process.env.GPK_CUKE_FN_RETRY_DELAY || '500')
const startingPort = Number(process.env.GPK_CUKE_STARTING_PORT || '18888')
const browserWidth = Number(process.env.GPK_CUKE_BROWSER_WIDTH || '1024')
const browserHeight = Number(process.env.GPK_CUKE_BROWSER_HEIGHT || '768')
const browserHeadless = process.env.GPK_CUKE_BROWSER_HEADLESS !== 'false'
const browserName = process.env.GPK_CUKE_BROWSER_NAME || 'chrome'
const screenshotOnFailure = process.env.GPK_CUKE_SCREENSHOT_ON_FAILURE !== false
const baseDir = process.env.GPK_CUKE_BASE_DIR || os.tmpdir()

module.exports = {
  verboseLogging,
  shortTimeout,
  mediumTimeout,
  longTimeout,
  startingPort,
  browserName,
  browserWidth,
  browserHeight,
  browserHeadless,
  screenshotOnFailure,
  baseDir,
  fnRetries,
  fnRetryDelay
}
