const { getConfig } = require('../config')
const config = getConfig()

function verboseLog () {
  if (config.verbose) {
    console.log.apply(console, arguments)
  }
}

module.exports = {
  verboseLog
}
