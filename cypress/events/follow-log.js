
// core dependencies
const { EventEmitter } = require('events')
const fs = require('fs')

// Returns an event emitter
function getLogStream (logFile) {
  const emitter = new EventEmitter()
  emitter.data = fs.readFileSync(logFile, { encoding: 'utf8' })

  const watcher = fs.watch(logFile)
  watcher.on('change', () => {
    const newData = fs.readFileSync(logFile, { encoding: 'utf8' })

    let chunk = ''
    if (newData.length > emitter.data.length) {
      chunk = newData.slice(emitter.data.length)
    } else if (newData.length < emitter.data.length) {
      console.warn('followLog: log file was truncated!')
    }

    emitter.data = newData
    emitter.emit('log', chunk)
  })

  return emitter
}

function followRestarts (logStream) {
  const countRestarts =
    () => Array.from(logStream.data.matchAll('Restarting kit...')).length

  logStream.restartsCount = countRestarts()
  let lastCount = logStream.restartsCount

  logStream.on('log', () => {
    const newCount = countRestarts()

    if (newCount !== lastCount) {
      // handle truncation
      const restartsOccured = newCount > lastCount ? newCount - lastCount : 1
      lastCount = newCount

      logStream.restartsCount += restartsOccured
      logStream.emit('restart', restartsOccured)
    }
  })

  return logStream
}

function followLog (logFile) {
  return followRestarts(
    getLogStream(logFile)
  )
}

module.exports = {
  followLog
}
