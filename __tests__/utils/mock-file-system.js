/* eslint-env jest */
/* eslint-disable no-prototype-builtins */

// core dependencies
const path = require('path')
const fs = require('fs')

function throwNotFound (filePath) {
  const err = new Error(`ENOENT: no such file or directory, open '${filePath}'`)
  err.code = 'ENOENT'
  throw err
}

function mockFileSystem (rootPath) {
  const spiesToTearDown = []
  const files = {}
  const directories = {}

  const originalFsFunctions = {
    promises: {
      readFile: fs.promises.readFile
    }
  }

  const writeFile = (pathParts, content) => {
    const partialPath = path.join(...pathParts)
    files[partialPath] = content
    return path.join(rootPath, partialPath)
  }

  const readFile = (pathParts) => {
    const filePath = path.join(...pathParts)
    return files[filePath]
  }

  const doesFileExist = (pathParts) => {
    return files.hasOwnProperty(path.join(...pathParts))
  }

  const createDirectory = (pathParts) => {
    const partialPath = path.join(...pathParts)
    directories[partialPath] = true
    return path.join(rootPath, partialPath)
  }

  const doesDirectoryExist = (pathParts) => {
    return directories.hasOwnProperty(path.join(...pathParts))
  }

  const teardown = () => {
    Object.keys(files).forEach(file => {
      delete files[file]
    })
    Object.keys(directories).forEach(dir => {
      delete directories[dir]
    })
    while (spiesToTearDown.length > 1) {
      spiesToTearDown.pop().mockClear()
    }
  }
  const setupSpies = () => {
    const prepFilePath = filePath => {
      return (filePath).replace(rootPath + path.sep, '').split(path.sec)
    }

    const readFileImplementation = (filePath, encoding) => {
      if (filePath.includes('node_modules/jest-worker')) {
        return originalFsFunctions.promises.readFile.apply(null, arguments)
      }
      if (encoding !== 'utf8') {
        throw new Error(`In this project we always read as UTF8 - if that changes please update the mock. [${encoding}] was provided`)
      }
      const trimmedPath = prepFilePath(filePath)
      if (doesFileExist(trimmedPath)) {
        return readFile(trimmedPath)
      } else {
        throwNotFound(filePath)
      }
    }

    const existsImplementation = filePath => doesFileExist(prepFilePath(filePath))

    const writeFileImplementation = (filePath, content) => {
      const trimmedPath = prepFilePath(filePath)
      writeFile(trimmedPath, content)
    }

    const promiseWrap = fn => function () {
      return new Promise((resolve, reject) => {
        process.nextTick(() => {
          try {
            const result = fn(...arguments)
            resolve(result)
          } catch (e) {
            reject(e)
          }
        })
      })
    }

    const rm = (path, options) => {
      const preparedPath = prepFilePath(path)
      if ((options || {}).recursive) {
        if (doesDirectoryExist(preparedPath)) {
          delete directories[preparedPath]
        } else {
          throwNotFound(path)
        }
      } else {
        if (doesFileExist(preparedPath)) {
          delete files[preparedPath]
        } else {
          throwNotFound(path)
        }
      }
    }

    jest.spyOn(fs, 'readFileSync').mockImplementation(readFileImplementation)
    jest.spyOn(fs, 'writeFileSync').mockImplementation(writeFileImplementation)
    jest.spyOn(fs, 'existsSync').mockImplementation(existsImplementation)
    jest.spyOn(fs.promises, 'readFile').mockImplementation(promiseWrap(readFileImplementation))
    jest.spyOn(fs.promises, 'writeFile').mockImplementation(promiseWrap(writeFileImplementation))
    if (fs.promises.rm) {
      jest.spyOn(fs.promises, 'rm').mockImplementation(promiseWrap(rm))
      spiesToTearDown.push(fs.promises.rm)
    } else {
      jest.spyOn(fs.promises, 'unlink').mockImplementation(promiseWrap(rm))
      jest.spyOn(fs.promises, 'rmdir').mockImplementation(promiseWrap(rm))
      spiesToTearDown.push(fs.promises.unlink)
      spiesToTearDown.push(fs.promises.rmdir)
    }

    spiesToTearDown.push(fs.readFileSync)
    spiesToTearDown.push(fs.writeFileSync)
    spiesToTearDown.push(fs.existsSync)
    spiesToTearDown.push(fs.promises.readFile)
    spiesToTearDown.push(fs.promises.writeFile)
  }
  return {
    writeFile,
    readFile,
    doesFileExist,
    createDirectory,
    doesDirectoryExist,
    teardown,
    setupSpies
  }
}

module.exports = {
  mockFileSystem
}
