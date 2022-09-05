const { exec } = require('child_process')
const { verboseLog } = require('./fileHelpers')

module.exports = {
  exec: (command, options) => {
    const optionsProcessed = Object.assign({}, options || {})

    optionsProcessed.env = optionsProcessed.env || {}
    optionsProcessed.env.LANG = optionsProcessed.env.LANG || process.env.LANG
    optionsProcessed.env.PATH = optionsProcessed.env.PATH || process.env.PATH

    const child = exec(command, optionsProcessed)

    child.stdout.on('data', function (data) {
      verboseLog('')
      verboseLog(' ---- ')
      verboseLog('')
      verboseLog('install update:')
      verboseLog(data)
      verboseLog('')
      verboseLog(' ---- ')
      verboseLog('')
    })
    child.stderr.on('data', function (data) {
      verboseLog('')
      verboseLog(' ---- ')
      verboseLog('')
      verboseLog('install error:')
      verboseLog(data)
      verboseLog('')
      verboseLog(' ---- ')
      verboseLog('')
    })

    return new Promise(function (resolve, reject) {
      child.on('close', function (code) {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error(`Exit code was ${code}`))
        }
      })
    })
  }
}
