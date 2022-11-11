const logger = require('./logger')
const c = require('ansi-colors')

const reportSuccess = async (tag) => {
  const message = `Succeeded [${tag}]`
  console.log(c.green(message))
  await logger.log(message)
}

const reportFailure = async (tag, link) => {
  const message = `Failed [${tag}]${link ? ` - documentation for the manual process is here: ${link}` : ''}`
  console.warn(c.yellow(message))
  await logger.log(message)
}

const addReporter = async (tag, link) => {
  await logger.log(`Started [${tag}]`)
  return async (result) => {
    if (result === true) {
      await reportSuccess(tag)
    } else if (result === false) {
      await reportFailure(tag, link)
    }
    return result
  }
}

module.exports = {
  reportSuccess,
  reportFailure,
  addReporter
}
