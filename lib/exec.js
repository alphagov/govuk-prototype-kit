const { spawn: crossSpawn } = require('cross-spawn')
const colors = require('ansi-colors')

function exec (command, options = {}, stdout) {
  const errorOutput = []
  const child = crossSpawn(command, [], { shell: true, ...options })

  if (child.stdout) {
    child.stdout.on('data', (data) => {
      if (stdout) {
        stdout(data)
      }
    })
  }
  if (child.stderr) {
    child.stderr.on('data', (data) => {
      errorOutput.push(data)
    })
  }

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve(true)
      } else {
        if (errorOutput.length > 0) {
          console.error(colors.red(errorOutput.join('\n')))
        }
        reject(new Error(`Exit code was ${code}`))
      }
    })
  })
}

function spawn (command, args, options = {}) {
  const child = crossSpawn(command, args, { ...options })

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve(true)
      } else {
        reject(new Error(`Exit code was ${code}`))
      }
    })
  })
}

module.exports = {
  exec,
  spawn
}
