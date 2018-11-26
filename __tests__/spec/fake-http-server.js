/* eslint-env jest */
// Core dependencies
const fs = require('fs')
const https = require('https')
const path = require('path')

// NPM dependencies
const request = require('supertest')

let server
let app = require('../../server.js')

describe('fake server', () => {
  beforeAll(() => {
    server = https.createServer({
      key: fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'test-server.key')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'test-server.crt')),
      rejectUnauthorized: false
    }, app)
  })

  afterAll(() => {
    server.close()
  })

  it('should return status code 200', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200)
  })

  it('should return html', async () => {
    const response = await request(app).get('/')
    expect(response.type).toBe('text/html')
  })
})
