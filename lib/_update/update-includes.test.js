/* eslint-env jest */

const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')

jest.mock('./util/fetch-original')
jest.mock('./util', () => {
  const originalModule = jest.requireActual('./util')

  return {
    ...originalModule,
    getProjectVersion: jest.fn(async () => '')
  }
})
const { fetchOriginal: mockFetchOriginal } = require('./util/fetch-original')
const { getProjectVersion: mockGetProjectVersion } = require('./util')
const { projectDir } = require('../path-utils')

const { updateIncludes } = require('./update-includes')

const originalIncludesHead = `<!--[if lte IE 8]><link href="/public/stylesheets/application-ie8.css" rel="stylesheet" type="text/css" /><![endif]-->
<!--[if gt IE 8]><!--><link href="/public/stylesheets/application.css" media="all" rel="stylesheet" type="text/css" /><!--<![endif]-->

{% for stylesheetUrl in extensionConfig.stylesheets %}
  <link href="{{ stylesheetUrl }}" rel="stylesheet" type="text/css" />
{% endfor %}
`

const newIncludesHead = fs.readFileSync(
  path.join(projectDir, 'app', 'views', 'includes', 'head.html'),
  'utf8'
)

const originalIncludesScripts = `<!-- Javascript -->
<script src="/public/javascripts/jquery-1.11.3.js"></script>

{% for scriptUrl in extensionConfig.scripts %}
  <script src="{{scriptUrl}}"></script>
{% endfor %}

<script src="/public/javascripts/application.js"></script>

{% if useAutoStoreData %}
  <script src="/public/javascripts/auto-store-data.js"></script>
{% endif %}
`

const newIncludesScripts = fs.readFileSync(
  path.join(projectDir, 'app', 'views', 'includes', 'scripts.html'),
  'utf8'
)

describe('updateIncludes', () => {
  let mockCopyFile, mockReadFile, mockWriteFile

  beforeEach(() => {
    mockGetProjectVersion.mockResolvedValue(
      '12.1.1'
    )

    mockFetchOriginal.mockRejectedValue(
      new Error('fetchOriginal called more times than expected')
    )

    mockCopyFile = jest.spyOn(fsp, 'copyFile').mockImplementation(async () => {})
    mockReadFile = jest.spyOn(fsp, 'readFile').mockResolvedValue(async () => {})
    mockWriteFile = jest.spyOn(fsp, 'writeFile').mockImplementation(async () => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('replaces app/views/includes/{head.html, scripts.html} if the user has not updated them', async () => {
    // original head.html
    mockFetchOriginal.mockResolvedValueOnce(
      originalIncludesHead
    )
    // their head.html
    mockReadFile.mockResolvedValueOnce(
      originalIncludesHead
    )
    // our head.html
    mockReadFile.mockResolvedValueOnce(
      newIncludesHead
    )

    // original scripts.html
    mockFetchOriginal.mockResolvedValueOnce(
      originalIncludesScripts
    )
    // their scripts.html
    mockReadFile.mockResolvedValueOnce(
      originalIncludesScripts
    )
    // our scripts.html
    mockReadFile.mockResolvedValueOnce(
      newIncludesScripts
    )

    await updateIncludes()

    expect(mockCopyFile).toHaveBeenCalledWith(
      path.join(projectDir, 'update', 'app', 'views', 'includes', 'head.html'),
      path.join(projectDir, 'app', 'views', 'includes', 'head.html')
    )

    expect(mockCopyFile).toHaveBeenCalledWith(
      path.join(projectDir, 'update', 'app', 'views', 'includes', 'scripts.html'),
      path.join(projectDir, 'app', 'views', 'includes', 'scripts.html')
    )
  })

  it('rewrites app/views/includes/{head.html, scripts.html} if the user has added lines to the bottom of the file', async () => {
    // original head.html
    mockFetchOriginal.mockResolvedValueOnce(
      originalIncludesHead
    )
    // their head.html
    mockReadFile.mockResolvedValueOnce(
      originalIncludesHead + '\n<link href="mystyles.css" rel="stylesheet" type="text/css" />\n'
    )
    // our head.html
    mockReadFile.mockResolvedValueOnce(
      newIncludesHead
    )

    // original scripts.html
    mockFetchOriginal.mockResolvedValueOnce(
      originalIncludesScripts
    )
    // their scripts.html
    mockReadFile.mockResolvedValueOnce(
      originalIncludesScripts + '\n<script>callMyCode()</script>\n'
    )
    // our scripts.html
    mockReadFile.mockResolvedValueOnce(
      newIncludesScripts
    )

    await updateIncludes()

    expect(mockWriteFile).toHaveBeenCalledWith(
      path.join(projectDir, 'app', 'views', 'includes', 'head.html'),
      newIncludesHead + '\n<link href="mystyles.css" rel="stylesheet" type="text/css" />\n',
      'utf8'
    )

    expect(mockWriteFile).toHaveBeenCalledWith(
      path.join(projectDir, 'app', 'views', 'includes', 'scripts.html'),
      newIncludesScripts + '\n<script>callMyCode()</script>\n',
      'utf8'
    )
  })

  it('rewrites app/views/includes/scripts.html even if it cannot rewrite head.html', async () => {
    // original head.html
    mockFetchOriginal.mockResolvedValueOnce(
      originalIncludesHead
    )
    // their head.html
    mockReadFile.mockResolvedValueOnce(
      '\n<link href="mystyles.css" rel="stylesheet" type="text/css" />\n'
    )
    // our head.html
    mockReadFile.mockResolvedValueOnce(
      newIncludesHead
    )

    // original scripts.html
    mockFetchOriginal.mockResolvedValueOnce(
      originalIncludesScripts
    )
    // their scripts.html
    mockReadFile.mockResolvedValueOnce(
      originalIncludesScripts + '\n<script>callMyCode()</script>\n'
    )
    // our scripts.html
    mockReadFile.mockResolvedValueOnce(
      newIncludesScripts
    )

    const mockConsoleWarn = jest.spyOn(global.console, 'warn').mockImplementation(() => {})

    await updateIncludes()

    expect(mockWriteFile).not.toHaveBeenCalledWith(
      path.join(projectDir, 'app', 'views', 'includes', 'head.html'),
      newIncludesHead + '\n<link href="mystyles.css" rel="stylesheet" type="text/css" />\n',
      'utf8'
    )

    expect(mockWriteFile).toHaveBeenCalledWith(
      path.join(projectDir, 'app', 'views', 'includes', 'scripts.html'),
      newIncludesScripts + '\n<script>callMyCode()</script>\n',
      'utf8'
    )

    expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
  })
})
