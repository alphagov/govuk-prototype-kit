const { mockFileSystem } = require('../../__tests__/utils/mock-file-system')
const { NunjucksLoader } = require('./nunjucksLoader')
const path = require('path')

const nunjucksPathJoin = (...parts) => parts.join('/')

describe('Nunjucks Loader', () => {
  let testScope

  beforeEach(() => {
    testScope = {
      fileSystem: mockFileSystem('/non-existent/users/the.user/documents/my-kit')
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
      filePath: path.join(testScope.viewsDir, 'includes', 'some-include.html')
    }
    testScope.someIncludeNjk = {
      fileContents: '<h1>This is "some include" (njk)</h1>',
      filePath: path.join(testScope.viewsDir, 'includes', 'some-include.njk')
    }
    testScope.fileSystem.writeFile(['app', 'views', 'index.html'], testScope.indexHtml.fileContents)
    testScope.fileSystem.writeFile(['app', 'views', 'index.njk'], testScope.indexNjk.fileContents)
    testScope.fileSystem.writeFile(['app', 'views', 'includes', 'some-include.html'], testScope.someIncludeHtml.fileContents)
    testScope.fileSystem.writeFile(['app', 'views', 'includes', 'some-include.njk'], testScope.someIncludeNjk.fileContents)
  })

  it('should load an HTML file based on an absolute path', () => {
    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource(testScope.indexHtml.filePath)

    expect(result).toEqual({
      noCache: false,
      path: testScope.indexHtml.filePath,
      src: testScope.indexHtml.fileContents
    })
  })

  it('should load an NJK file based on an absolute path', () => {
    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource(testScope.indexNjk.filePath)

    expect(result).toEqual({
      noCache: false,
      path: testScope.indexNjk.filePath,
      src: testScope.indexNjk.fileContents
    })
  })

  it('should load a file based on an relative path with the correct (html) extension', () => {
    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource('includes/some-include.html')

    expect(result).toEqual({
      noCache: false,
      path: testScope.someIncludeHtml.filePath,
      src: testScope.someIncludeHtml.fileContents
    })
  })

  it('should load a file based on an relative path with the correct (njk) extension', () => {
    const loader = new NunjucksLoader([nunjucksPathJoin(testScope.viewsDir)])

    const result = loader.getSource('includes/some-include.njk')

    expect(result).toEqual({
      noCache: false,
      path: testScope.someIncludeNjk.filePath,
      src: testScope.someIncludeNjk.fileContents
    })
  })
})
