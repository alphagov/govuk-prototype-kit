// First-party helpers for styling terminal output, replacing the parts of
// the `ansi-colors` package we previously used. Each helper wraps text in
// the ANSI escape codes for that colour.

const wrapWithEscapeCodes = (openCode, closeCode) => (text) => `[${openCode}m${text}[${closeCode}m`

module.exports = {
  red: wrapWithEscapeCodes(31, 39),
  green: wrapWithEscapeCodes(32, 39),
  yellow: wrapWithEscapeCodes(33, 39),
  cyan: wrapWithEscapeCodes(36, 39)
}
