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
    readFileSync: fs.readFileSync,
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

  const deleteFile = (pathParts) => {
    const partialPath = path.join(...pathParts)
    delete files[partialPath]
  }

  const deleteDirectory = (pathParts) => {
    const partialPath = path.join(...pathParts)
    delete directories[partialPath]
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
  const getRootPath = () => rootPath
  const setupSpies = () => {
    const prepFilePath = filePath => {
      return (filePath).replace(rootPath + path.sep, '').split(path.sep)
    }

    function readFileCore (filePath, encoding) {
      if (encoding !== 'utf8') {
        throw new Error(`In this project we always read as UTF8 - if that changes please update the mock. [${encoding}] was provided for path [${filePath}]`)
      }
      const trimmedPath = prepFilePath(filePath)
      if (doesFileExist(trimmedPath)) {
        return readFile(trimmedPath)
      } else {
        throwNotFound(filePath)
      }
    }

    const readFileImplementationForPromise = (filePath, encoding) => {
      if (filePath.includes('node_modules/jest-') || filePath.includes('node_modules/chalk')) {
        return originalFsFunctions.promises.readFile.apply(null, arguments)
      }
      return readFileCore(filePath, encoding)
    }

    const readFileImplementation = (filePath, encoding) => {
      if (filePath.includes('node_modules/jest-') || filePath.includes('node_modules/chalk')) {
        return originalFsFunctions.readFileSync.apply(null, arguments)
      }
      return readFileCore(filePath, encoding)
    }

    const existsImplementation = filePath => doesFileExist(prepFilePath(filePath)) || doesDirectoryExist(prepFilePath(filePath))

    const writeFileImplementation = (filePath, content) => {
      const trimmedPath = prepFilePath(filePath)
      writeFile(trimmedPath, content)
    }

    const lstatImplementation = (filePath) => {
      const fileExists = doesFileExist(prepFilePath(filePath))
      const directoryExists = doesDirectoryExist(prepFilePath(filePath))
      if (fileExists || directoryExists) {
        return {
          isDirectory: () => directoryExists
        }
      }
    }

    const readdirImplementation = (filePath) => {
      const preppedPath = prepFilePath(filePath)
      if (!doesDirectoryExist(preppedPath)) {
        throw new Error('This is the wrong error, please make this error more accurate if you experience it.  The directory doesn\'t exist')
      }
      const dirPathString = preppedPath.join(path.sep)
      return [...Object.keys(directories), ...Object.keys(files)].filter(file => {
        if (!file.startsWith(dirPathString)) {
          return false
        }
        return dirPathString.split(path.sep).length === file.split(path.sep).length - 1
      }).map(filename => filename.split(path.sep).at(-1))
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
    jest.spyOn(fs, 'lstatSync').mockImplementation(lstatImplementation)
    jest.spyOn(fs, 'readdirSync').mockImplementation(readdirImplementation)
    jest.spyOn(fs.promises, 'readFile').mockImplementation(promiseWrap(readFileImplementationForPromise))
    jest.spyOn(fs.promises, 'writeFile').mockImplementation(promiseWrap(writeFileImplementation))
    jest.spyOn(fs.promises, 'lstat').mockImplementation(promiseWrap(lstatImplementation))
    jest.spyOn(fs.promises, 'readdir').mockImplementation(promiseWrap(readdirImplementation))
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
    spiesToTearDown.push(fs.lstatSync)
    spiesToTearDown.push(fs.promises.readFile)
    spiesToTearDown.push(fs.promises.writeFile)
    spiesToTearDown.push(fs.promises.lstat)
  }
  return {
    writeFile,
    deleteFile,
    readFile,
    doesFileExist,
    createDirectory,
    deleteDirectory,
    doesDirectoryExist,
    teardown,
    setupSpies,
    getRootPath
  }
}

module.exports = {
  mockFileSystem
}
