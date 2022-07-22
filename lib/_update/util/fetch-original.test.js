/* eslint-env jest */

const https = require('https')
const stream = require('stream')

const { fetchOriginal } = require('./fetch-original')

describe('fetchOriginal', () => {
  it('gets the contents of a file as of version from GitHub', async () => {
    const mockHttpsGet = jest.spyOn(https, 'get').mockImplementation((url, callback) => {
      const response = new stream.PassThrough()
      response.statusCode = 200

      callback(response)

      response.write('foo\n')
      response.write('bar\n')
      response.end()
    })

    await expect(fetchOriginal('99.99.99', 'app/views/foo.html')).resolves.toEqual(
      'foo\nbar\n'
    )
    expect(mockHttpsGet).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/alphagov/govuk-prototype-kit/v99.99.99/app/views/foo.html',
      expect.anything()
    )
  })
})
