const cp = require('child_process')
const path = require('path')
const events = require('events')

const { startingPort, verboseLogging, baseDir } = require('./config')
const fs = require('fs')

let nextPort = startingPort

function addInitialGitCommitToConfig (config) {
  return new Promise((resolve, reject) => {
    cp.exec('git log --pretty="%H"', { cwd: config.directory }, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }
      const result = (stdout || '').split(/[\n\r]+/)[0]
      if (result && result.trim()) {
        resolve({ ...config, initialCommit: result.trim() })
      } else {
        resolve({ ...config })
      }
    })
  })
}

function resetState (config) {
  if (!config?.initialCommit) {
    throw new Error('It\'s not possible to reset the state as no innitial commit exists in the config.')
  }
  return new Promise((resolve, reject) => {
    cp.exec(`git reset --hard ${config.initialCommit} && npm prune && npm install`, { cwd: config.directory }, (err) => {
      if (err) {
        reject(err)
      } else {
        config.kitStartedEventEmitter.on('started', () => {
          resolve()
        })
      }
    })
  })
}

function initKit (config) {
  if (config.directory) {
    return Promise.resolve({ startCommand: 'npm run dev', ...config })
  }
  const tmpDir = config.directory || path.join(baseDir, new Date().getTime() + '_' + ('' + Math.random()).split('.')[1])
  const rootDir = path.resolve(__dirname, '../../..')

  console.log('Directory contents', fs.readdirSync(rootDir))

  return new Promise((resolve, reject) => {
    let startCommand
    const initProcess = cp.spawn('./bin/cli', ['create', `--version=${rootDir}`, tmpDir], { cwd: rootDir })
    initProcess.stderr.on('data', (data) => console.warn('[stderr]', data.toString()))
    initProcess.stdout.on('data', (data) => {
      const str = data.toString()
      if (verboseLogging) {
        console.log(str)
      }
      // eslint-disable-next-line no-unused-vars
      const [_, command] = str.split('To run your prototype:')
      if (command && command.trim()) {
        startCommand = command.trim()
      }
    })
    initProcess.on('error', (error) => {
      reject(error)
    })

    initProcess.on('close', code => {
      if (startCommand) {
        resolve({ ...config, startCommand, directory: tmpDir, kitStartedEventEmitter: new events.EventEmitter() })
      } else {
        reject(new Error('initialisation failed'))
      }
    })
  })
}

function runKit (config) {
  let hasReturned = false

  return new Promise((resolve, reject) => {
    const [command, ...args] = config.startCommand.split(' ')
    const kitProcess = cp.spawn(command, args, {
      cwd: config.directory,
      detached: true,
      env: {
        ...process.env,
        PORT: nextPort++,
        GPK_NO_STDIN: 'true'
      }
    })

    kitProcess.stderr.on('data', (data) => console.warn('[stderr]', data.toString()))
    kitProcess.stdout.on('data', (data) => {
      const str = data.toString()
      const regExpMatchArray = str.match(/(http:\/\/localhost:\d+)/)
      if (regExpMatchArray && regExpMatchArray[1]) {
        config.kitStartedEventEmitter.emit('started')
        if (hasReturned) {
          return
        }
        hasReturned = true
        resolve({
          ...config,
          serverAddress: regExpMatchArray[1].trim(),
          close: () => {
            kitProcess.stdin.pause()
            try {
              process.kill(-kitProcess.pid, 'SIGTERM')
            } catch (err) {
              console.error('error while stopping process')
              console.error(err)
            }
          }
        })
      }
    })
    kitProcess.on('error', (error) => {
      reject(error)
    })

    kitProcess.on('close', code => {
      reject(new Error('initialisation failed'))
    })
  })
}

module.exports = {
  startKit: (config = {}) => initKit(config)
    .then(addInitialGitCommitToConfig)
    .then(runKit),
  resetState
}
