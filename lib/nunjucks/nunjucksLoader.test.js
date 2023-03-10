/* eslint-env jest */
/* eslint-disable no-new */

const path = require('path')

const chokidar = require('chokidar')

const { mockFileSystem } = require('../../__tests__/utils/mock-file-system')
const { NunjucksLoader } = require('./nunjucksLoader')
const config = require('../config')
const plugins = require('../plugins/plugins')

const nunjucksPathJoin = (...parts) => parts.join('/')

describe('Nunjucks Loader', () => {
  let testScope
  const rootPathParts = [path.join('non-existent', 'users', 'the.user', 'documents', 'my-kit')]
  if (path.sep === '/') {
    rootPathParts.unshift('/')
  } else {
    rootPathParts.unshift('C:\\')
  }
  const rootPath = rootPathParts.join('')

  console.log('root path', rootPath)

  beforeEach(() => {
    testScope = {
      fileSystem: mockFileSystem(rootPath),
      config: {
        isDevelopment: true,
        isProduction: false,
        useNjkExtensions: false
      },
      chokidarFns: {},
      importNunjucksMacrosInto: [],
      nunjucksMacros: []
    }
    testScope.fileSystem.setupSpies()

    testScope.viewsDir = testScope.fileSystem.createDirectory(['app', 'views'])

    testScope.fileSystem.createDirectory(['app', 'views', 'includes'])

    testScope.fileContents = {}
    testScope.indexHtml = {
      fileContents: '<h1>Hello index.html</h1>',
      filePath: path.join(testScope.viewsDir, 'index.html')
    }
    testScope.indexNjk = {
      fileContents: '<h1>Hello index.njk</h1>',
      filePath: path.join(testScope.viewsDir, 'index.njk')
    }
    testScope.someIncludeHtml = {
      fileContents: '<h1>This is "some include" (html)</h1>',
      filePath: path.join(testScope.viewsDir, 'includes', 'some-include.html'),
      relativePath: 'includes/some-include.html'
    }
    testScope.someIncludeNjk = {
      fileContents: '<h1>This is "some include" (njk)</h1>',
      filePath: path.join(testScope.viewsDir, 'includes', 'some-include.njk'),
      relativePath: 'includes/some-include.njk'
    }
    testScope.fileSystem.writeFile(['app', 'views', 'index.html'], testScope.indexHtml.fileContents)
    testScope.fileSystem.writeFile(['app', 'views', 'index.njk'], testScope.indexNjk.fileContents)
    testScope.fileSystem.writeFile(['app', 'views', 'includes', 'some-include.html'], testScope.someIncludeHtml.fileContents)
    testScope.fileSystem.writeFile(['app', 'views', 'includes', 'some-include.njk'], testScope.someIncludeNjk.fileContents)

    jest.spyOn(config, 'getConfig').mockReturnValue(testScope.config)
    const chokidarReturnValue = {}
    testScope.chokidarOn = jest.fn((type, fn) => {
      testScope.chokidarFns[type] = fn
      return chokidarReturnValue
    })
    chokidarReturnValue.on = testScope.chokidarOn
    jest.spyOn(chokidar, 'watch').mockReturnValue(chokidarReturnValue)

    jest.spyOn(plugins, 'getFileSystemPaths').mockImplementation((type) => {
      if (type !== 'importNunjucksMacrosInto') {
        throw new Error(`Was expecting type importNunjucksMacrosInto, got type [${type}]`)
      }
      return testScope.importNunjucksMacrosInto
    })

    jest.spyOn(plugins, 'getByType').mockImplementation(type => {
      if (type !== 'nunjucksMacros') {
        throw new Error(`Was expecting type importNunjucksMacrosInto, got type [${type}]`)
      }
      return testScope.nunjucksMacros
    })
  })

  it('should load an HTML file based on an absolute path', () => {
    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource(testScope.indexHtml.filePath)

    expect(result).toEqual({
      noCache: true,
      path: testScope.indexHtml.filePath,
      src: testScope.indexHtml.fileContents
    })
  })

  it('should load an NJK file based on an absolute path', () => {
    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource(testScope.indexNjk.filePath)

    expect(result).toEqual({
      noCache: true,
      path: testScope.indexNjk.filePath,
      src: testScope.indexNjk.fileContents
    })
  })

  it('should load a file based on an relative path with the correct (html) extension', () => {
    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource(testScope.someIncludeHtml.relativePath)

    expect(result).toEqual({
      noCache: true,
      path: testScope.someIncludeHtml.filePath,
      src: testScope.someIncludeHtml.fileContents
    })
  })

  it('should load a file based on an relative path with the correct (njk) extension', () => {
    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource(testScope.someIncludeNjk.relativePath)

    expect(result).toEqual({
      noCache: true,
      path: testScope.someIncludeNjk.filePath,
      src: testScope.someIncludeNjk.fileContents
    })
  })

  it('should load the njk file when no extension is given and njk is specified as the default in the config', () => {
    testScope.config.useNjkExtensions = true

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource('includes/some-include')

    expect(result).toEqual({
      noCache: true,
      path: testScope.someIncludeNjk.filePath,
      src: testScope.someIncludeNjk.fileContents
    })
  })

  it('should load the html file when no extension is given and njk is not specified as the default in the config', () => {
    testScope.config.useNjkExtensions = false

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource('includes/some-include')

    expect(result).toEqual({
      noCache: true,
      path: testScope.someIncludeHtml.filePath,
      src: testScope.someIncludeHtml.fileContents
    })
  })

  it('should find a .html when a nonexistent .njk file is requested', () => {
    const contents = 'Ths is the page'

    testScope.fileSystem.writeFile(['app', 'views', 'my-page.html'], contents)

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource('my-page.njk')

    expect(result).toEqual({
      noCache: true,
      path: path.join(testScope.viewsDir, 'my-page.html'),
      src: contents
    })
  })

  it('should find a .njk when a nonexistent .html file is requested', () => {
    const contents = 'Ths is the page'

    testScope.fileSystem.writeFile(['app', 'views', 'my-page.njk'], contents)

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource('my-page.html')

    expect(result).toEqual({
      noCache: true,
      path: path.join(testScope.viewsDir, 'my-page.njk'),
      src: contents
    })
  })

  it('should find a .njk when the .html file is in a lower priority folder', () => {
    const contents = 'This is the page'
    const backupDir = testScope.fileSystem.createDirectory(['backup'])

    const filePath = testScope.fileSystem.writeFile(['app', 'views', 'my-page.njk'], contents)
    testScope.fileSystem.writeFile(['backup', 'my-page.html'], 'This is not the contents')

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir), nunjucksPathJoin(backupDir)])

    const result = loader.getSource('my-page.html')

    expect(result).toEqual({
      noCache: true,
      path: filePath,
      src: contents
    })
  })

  it('should find a .html when the .njk file is in a lower priority folder', () => {
    const contents = 'This is the page'
    const backupDir = testScope.fileSystem.createDirectory(['backup'])

    const filePath = testScope.fileSystem.writeFile(['app', 'views', 'my-page.html'], contents)
    testScope.fileSystem.writeFile(['backup', 'my-page.njk'], 'This is not the contents')

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir), nunjucksPathJoin(backupDir)])

    const result = loader.getSource('my-page.njk')

    expect(result).toEqual({
      noCache: true,
      path: filePath,
      src: contents
    })
  })

  it('should watch the first app view in dev mode', () => {
    new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir), 'do not watch', 'another not to watch'])

    expect(chokidar.watch).toHaveBeenCalledWith(testScope.viewsDir, { ignoreInitial: true, disableGlobbing: true })
    expect(testScope.chokidarOn).toHaveBeenCalledWith('add', expect.any(Function))
    expect(testScope.chokidarOn).toHaveBeenCalledWith('unlink', expect.any(Function))
    expect(testScope.chokidarOn).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should fall back to njk when the html file is deleted', () => {
    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])
    jest.spyOn(loader, 'emit')

    const resultBeforeDeleting = loader.getSource(testScope.someIncludeHtml.filePath)

    expect(resultBeforeDeleting).toEqual({
      noCache: true,
      path: testScope.someIncludeHtml.filePath,
      src: testScope.someIncludeHtml.fileContents
    })

    testScope.chokidarFns.unlink(path.join(testScope.viewsDir, 'includes', 'some-include.html'))

    const resultAfterDeleting = loader.getSource(testScope.someIncludeHtml.filePath)

    expect(loader.emit).toHaveBeenCalledWith('update', testScope.someIncludeHtml.relativePath)
    expect(loader.emit).toHaveBeenCalledWith('update', path.join(testScope.viewsDir, testScope.someIncludeHtml.relativePath))

    expect(resultAfterDeleting).toEqual({
      noCache: true,
      path: testScope.someIncludeNjk.filePath,
      src: testScope.someIncludeNjk.fileContents
    })
  })

  it('should allow find the lower priority view when the higher priority view is deleted', () => {
    const primaryFileContents = 'abc'
    const secondaryFileContents = 'def'

    testScope.fileSystem.createDirectory(['primary'])
    testScope.fileSystem.createDirectory(['primary', 'layouts'])
    testScope.fileSystem.createDirectory(['secondary'])
    testScope.fileSystem.createDirectory(['secondary', 'layouts'])

    const primaryFilePath = testScope.fileSystem.writeFile(['primary', 'layouts', 'main.html'], primaryFileContents)
    const secondaryFilePath = testScope.fileSystem.writeFile(['secondary', 'layouts', 'main.html'], secondaryFileContents)

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.fileSystem.getRootPath(), 'primary'), nunjucksPathJoin(testScope.fileSystem.getRootPath(), 'secondary')])
    jest.spyOn(loader, 'emit')

    const resultBeforeDeleting = loader.getSource('layouts/main.html')

    expect(resultBeforeDeleting).toEqual({
      noCache: true,
      path: primaryFilePath,
      src: primaryFileContents
    })

    testScope.chokidarFns.unlink(primaryFilePath)

    expect(loader.emit).toHaveBeenCalledWith('update', primaryFilePath)
    expect(loader.emit).toHaveBeenCalledWith('update', 'layouts/main.html')

    const resultAfterDeleting = loader.getSource('layouts/main.html')

    expect(resultAfterDeleting).toEqual({
      noCache: true,
      path: secondaryFilePath,
      src: secondaryFileContents
    })
  })

  it('should override html when the njk file is created and njk takes priority', () => {
    testScope.config.useNjkExtensions = true
    const htmlContent = '<h1>Hello html</h1>'
    const njkContent = '<h1>Hello njk</h1>'
    const view = 'directory/file'
    testScope.fileSystem.createDirectory(['app', 'views', 'directory'])
    testScope.fileSystem.writeFile(['app', 'views', 'directory', 'file.html'], htmlContent)

    const loader = new NunjucksLoader([testScope.viewsDir])
    jest.spyOn(loader, 'emit')

    const resultBeforeDeleting = loader.getSource(view)

    expect(resultBeforeDeleting).toEqual({
      noCache: true,
      path: path.join(testScope.viewsDir, 'directory', 'file.html'),
      src: htmlContent
    })

    testScope.fileSystem.writeFile(['app', 'views', 'directory', 'file.njk'], njkContent)
    testScope.chokidarFns.add(path.join(testScope.viewsDir, 'directory', 'file.njk'))

    const resultAfterAdding = loader.getSource(view)

    expect(loader.emit).toHaveBeenCalledWith('update', 'directory/file.njk')
    expect(loader.emit).toHaveBeenCalledWith('update', path.join(testScope.viewsDir, 'directory', 'file.njk'))

    expect(resultAfterAdding).toEqual({
      noCache: true,
      path: path.join(testScope.viewsDir, 'directory', 'file.njk'),
      src: njkContent
    })
  })

  it('should allow a newly created file to be available as a relative path', () => {
    const htmlContent = '<h1>Hello html</h1>'
    testScope.fileSystem.createDirectory(['app', 'views', 'directory'])
    const view = 'directory/file'

    const loader = new NunjucksLoader([testScope.viewsDir])
    jest.spyOn(loader, 'emit')

    testScope.fileSystem.writeFile(['app', 'views', 'directory', 'file.html'], htmlContent)
    testScope.chokidarFns.add(path.join(testScope.viewsDir, 'directory', 'file.html'))

    expect(loader.emit).toHaveBeenCalledWith('update', 'directory/file.html')
    expect(loader.emit).toHaveBeenCalledWith('update', path.join(testScope.viewsDir, 'directory', 'file.html'))

    const resultAfterAdding = loader.getSource(view)

    expect(resultAfterAdding).toEqual({
      noCache: true,
      path: path.join(testScope.viewsDir, 'directory', 'file.html'),
      src: htmlContent
    })
  })

  it('should allow a newly created file to be available as a relative path at the top level', () => {
    const htmlContent = '<h1>Hello html</h1>'
    const view = 'file'

    const loader = new NunjucksLoader([testScope.viewsDir])
    jest.spyOn(loader, 'emit')

    testScope.fileSystem.writeFile(['app', 'views', 'file.html'], htmlContent)
    testScope.chokidarFns.add(path.join(testScope.viewsDir, 'file.html'))

    expect(loader.emit).toHaveBeenCalledWith('update', 'file.html')
    expect(loader.emit).toHaveBeenCalledWith('update', path.join(testScope.viewsDir, 'file.html'))

    const resultAfterAdding = loader.getSource(view)

    expect(resultAfterAdding).toEqual({
      noCache: true,
      path: path.join(testScope.viewsDir, 'file.html'),
      src: htmlContent
    })
  })

  it('should update view when change is detected', () => {
    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])
    jest.spyOn(loader, 'emit')

    const resultBeforeChange = loader.getSource(testScope.indexHtml.filePath)

    expect(resultBeforeChange).toEqual({
      noCache: true,
      path: testScope.indexHtml.filePath,
      src: testScope.indexHtml.fileContents
    })

    testScope.fileSystem.writeFile(['app', 'views', 'index.html'], '<h1>This is the new view</h1>')
    testScope.chokidarFns.change(path.join(testScope.viewsDir, 'index.html'))

    expect(loader.emit).toHaveBeenCalledWith('update', 'index.html')
    expect(loader.emit).toHaveBeenCalledWith('update', path.join(testScope.viewsDir, 'index.html'))

    const resultAfterChange = loader.getSource(testScope.indexHtml.filePath)

    expect(resultAfterChange).toEqual({
      noCache: true,
      path: testScope.indexHtml.filePath,
      src: '<h1>This is the new view</h1>'
    })
  })

  it('should have importNunjucksMacrosInto functionality when loading', () => {
    testScope.importNunjucksMacrosInto.push(testScope.indexHtml.filePath)
    testScope.nunjucksMacros.push({
      item: {
        macroName: 'thisIsMyMacro',
        importFrom: 'the/file/location.html'
      }
    })

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    testScope.chokidarFns.change(path.join(testScope.viewsDir, 'index.html'))

    const result = loader.getSource(testScope.indexHtml.filePath)

    const importString = '{% from "the/file/location.html" import thisIsMyMacro %}'

    expect(result).toEqual({
      noCache: true,
      path: testScope.indexHtml.filePath,
      src: testScope.indexHtml.fileContents + importString
    })
  })

  it('should have importNunjucksMacrosInto functionality after updating', () => {
    testScope.importNunjucksMacrosInto.push(testScope.indexHtml.filePath)
    testScope.nunjucksMacros.push({
      item: {
        macroName: 'thisIsMyMacro',
        importFrom: 'the/file/location.html'
      }
    })

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource(testScope.indexHtml.filePath)

    const importString = '{% from "the/file/location.html" import thisIsMyMacro %}'

    expect(result).toEqual({
      noCache: true,
      path: testScope.indexHtml.filePath,
      src: testScope.indexHtml.fileContents + importString
    })
  })

  it('should have importNunjucksMacrosInto functionality after updating', () => {
    const backupDir = testScope.fileSystem.createDirectory(['backup'])
    testScope.fileSystem.createDirectory(['backup', 'layouts'])
    testScope.fileSystem.createDirectory(['app', 'views', 'layouts'])

    const backupMainFileContents = 'the backup main'
    const userMainFileContents = 'the user main'

    const backupMainFilePath = testScope.fileSystem.writeFile(['backup', 'layouts', 'main.html'], backupMainFileContents)
    const userMainFilePath = testScope.fileSystem.writeFile(['app', 'views', 'layouts', 'main.html'], userMainFileContents)

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir), nunjucksPathJoin(backupDir)])

    const resultBeforeDeletion = loader.getSource('layouts/main.html')

    expect(resultBeforeDeletion).toEqual({
      noCache: true,
      path: userMainFilePath,
      src: userMainFileContents
    })

    testScope.chokidarFns.unlink(userMainFilePath)

    const resultAfterDeletion = loader.getSource('layouts/main.html')

    expect(resultAfterDeletion).toEqual({
      noCache: true,
      path: backupMainFilePath,
      src: backupMainFileContents
    })
  })

  it('should have importNunjucksMacrosInto functionality after addition', () => {
    const backupDir = testScope.fileSystem.createDirectory(['backup'])
    testScope.fileSystem.createDirectory(['backup', 'layouts'])
    testScope.fileSystem.createDirectory(['app', 'views', 'layouts'])

    const backupMainFileContents = 'the backup main'
    const userMainFileContents = 'the user main'

    const backupMainFilePath = testScope.fileSystem.writeFile(['backup', 'layouts', 'main.html'], backupMainFileContents)

    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir), nunjucksPathJoin(backupDir)])

    const resultBeforeCreation = loader.getSource('layouts/main.html')

    expect(resultBeforeCreation).toEqual({
      noCache: true,
      path: backupMainFilePath,
      src: backupMainFileContents
    })

    const userMainFilePath = testScope.fileSystem.writeFile(['app', 'views', 'layouts', 'main.html'], userMainFileContents)
    testScope.chokidarFns.add(userMainFilePath)

    const resultAfterCreation = loader.getSource('layouts/main.html')

    expect(resultAfterCreation).toEqual({
      noCache: true,
      path: userMainFilePath,
      src: userMainFileContents
    })
  })

  describe('Production mode', () => {
    beforeEach(() => {
      testScope.config.isDevelopment = false
      testScope.config.isProduction = true
    })

    it('should tell nunjucks not to cache', () => {
      const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

      const result = loader.getSource(testScope.indexHtml.filePath)

      expect(result).toEqual({
        noCache: false,
        path: testScope.indexHtml.filePath,
        src: testScope.indexHtml.fileContents
      })
    })

    it('should not watch files in production mode', () => {
      new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

      expect(testScope.chokidarOn).not.toHaveBeenCalled()
    })
  })

  describe('inner workings', () => {
    beforeEach(() => {
      testScope.loader = new NunjucksLoader([])
    })
    it('should give zero when they\'re the same', () => {
      expect(testScope.loader.sortByPriority({ appViewDirIndex: 1 }, { appViewDirIndex: 1 })).toBe(0)
    })
    it('should give one when they\'re the right is smaller', () => {
      expect(testScope.loader.sortByPriority({ appViewDirIndex: 2 }, { appViewDirIndex: 1 })).toBe(1)
    })
    it('should give minus one when they\'re the left is smaller', () => {
      expect(testScope.loader.sortByPriority({ appViewDirIndex: 1 }, { appViewDirIndex: 2 })).toBe(-1)
    })
    it('should sort by appViewDirIndex', () => {
      const input = [
        {
          appViewDirIndex: 3,
          id: 'a'
        },
        {
          appViewDirIndex: 3,
          id: 'b'
        },
        {
          appViewDirIndex: 0,
          id: 'c'
        }
      ]
      expect(input.sort(testScope.loader.sortByPriority)).toEqual([
        {
          appViewDirIndex: 0,
          id: 'c'
        },
        {
          appViewDirIndex: 3,
          id: 'a'
        },
        {
          appViewDirIndex: 3,
          id: 'b'
        }]
      )
    })
    it('should sort by appViewDirIndex', () => {
      const input = [
        undefined,
        {
          appViewDirIndex: 3,
          id: 'a'
        },
        undefined
      ]
      expect(input.sort(testScope.loader.sortByPriority)).toEqual([
        {
          appViewDirIndex: 3,
          id: 'a'
        },
        undefined,
        undefined
      ])
    })
  })
})
