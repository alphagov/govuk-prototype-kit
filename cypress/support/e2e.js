// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// import './commands'

// Alternatively you can use CommonJS syntax:
require('./commands')

// When a test fails do not run any more tests within the the current spec file
afterEach(function () {
  if (this.currentTest.state === 'failed') {
    console.log("============ STOPPED THE TESTS??? ===============")
    console.log("============ STOPPED THE TESTS??? ===============")
    console.log("============ STOPPED THE TESTS??? ===============")
    console.log("============ STOPPED THE TESTS??? ===============")
    console.log("============ STOPPED THE TESTS??? ===============")
    console.log("============ STOPPED THE TESTS??? ===============")
    console.log("============ STOPPED THE TESTS??? ===============")
    console.log("============ STOPPED THE TESTS??? ===============")
    Cypress.stop()
  }
})
