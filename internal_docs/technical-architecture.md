# Technical architecture of the GOV.UK Prototype Kit

## How the kit is used

Users create a new prototype as a Node.js project with the kit as a dependency. The kit is published as a package on npm (see the docs on [releasing](./releasing/releasing.md))

The kit includes a command line tool which users should run to start the kit (usually via an npm script).

To help users to create a new prototype, the kit command line tool includes a `create` command. It creates a new prototype using the files from the folder [prototype-starter](/prototype-starter) in this repo.

Users will normally start their prototype using the command `npm run dev`. This starts the prototype in a development configuration.

When running a prototype, the kit creates a HTTP server, hosted at `localhost:3000`, which automatically renders any templates in the prototype matching `app/views/<name>.html` folder at the URL path `/<name>`. It will also host assets in the `app/assets` folder under the path `/public`, and compiles any Sass stylesheets matching `app/assets/stylesheets/*.scss` before hosting the stylesheets at `/public/stylesheets`.

### Hosting prototypes

When deploying a prototype to be shared on the internet most services will run the command `npm start`, so we reserve this command for running a hardened production configuration.

We want prototypes to be hidden from search engines and hard for normal internet users to access, so we require that prototypes hosted online have a password. We also require HTTPS and change a few other things to improve the security of the prototype.

### Manage prototype pages

Some parts of the prototype can be configured or inspected via webpages at `http://localhost:3000/manage-prototype` (only when running locally). These web pages are created by a separate app, so that prototype authors are not able to modify these pages.

### Plugins

We want people to be able to extend the capabilities of the kit. We have a plugin subsystem that detects npm packages that contain a `govuk-prototype-kit-config.json` manifest and exposes files described by that manifest to the prototype. For instance, this can be used to share layouts and templates.

## What the kit comes with

To help users create prototypes, the kit has a number of dependencies of its own.

These include:

- [Node.js Express][expressjs] framework

This provides the basic working of the kit - a web server that can handle requests, render templates to HTML and respond to the browser.

- [Nunjucks][nunjucks] templating

This allows us to keep each page template simple - and inherit the [GOV.UK Frontend][govuk-frontend] template from one place. It has powerful features such as looping over an array of variables, that make more complex prototypes much easier.

- [Nodemon][nodemon] to watch files and restart the server

This means any changes to routes.js or other server files are updated instantly in the prototype.

- [Browsersync][browsersync] to reload the browser with any changes

We serve pages in a user's prototype via Browsersync. This means any changes to user templates, Sass or JavaScript are updated instantly in the browser without needing to manually refresh.  Note that this does not work for the manage prototype pages.

- [Portscanner][portscanner] to find a free port to run the kit on

This means if the user runs more than one prototype, the first will be on port 3000, the next on 3001 and so on.

- [Jest][jest] and [Cypress][cypress] to run tests

We write unit and integration tests using Jest, and acceptance tests using Cypress.

[expressjs]: https://expressjs.com/
[nunjucks]: https://mozilla.github.io/nunjucks/
[govuk-frontend]: https://frontend.design-system.service.gov.uk/
[nodemon]: https://nodemon.io/
[browsersync]: https://browsersync.io/
[portscanner]: https://www.npmjs.com/package/portscanner
[jest]: https://jestjs.io/
[cypress]: https://www.cypress.io/

## Working on the kit

When you want to see what a user would when working on a prototype, the kit package in this repo has a number of npm scripts for developers:

- `npm run start:dev` - creates and starts a new prototype in a temporary folder, with the prototype kit package linked
- `npm run start:test` - creates and starts a new prototype in a temporary folder, making sure to install the kit and dependencies in the same way as users
- `npm run start:test:prod` - similar to above, this simulates running a prototype in production, but without having to worry about certificates for HTTPS
- `npm run lint` - run linter
- `npm run test` - runs unit and integration tests, and the linter
- `npm run test:acceptance:open` - open Cypress allowing running acceptance tests individually and debugging results (dev acceptance tests only)
- `npm run test:acceptance:dev` - runs main suite of acceptance tests in headless mode (there are other suites that are usually run in CI only)

### Layout of code

The code in this repo is roughly laid out as below:

- `__tests__/` - integration tests
- `bin/` - the `govuk-prototype-kit` command line interface
- `cypress/` - acceptance tests
- `internal_docs/` - developer docs in Markdown, including this document
- `lib/` - most source code goes in here
- `migrator/` - to help users migrate an existing prototype using a version of the kit pre-13, we have a `migrate` command
- `prototype-starter/` - files that are are copied to create a new empty prototype kit project
- `scripts/` - small self-contained scripts used for development
- `tmp/` - some tests put files in here
- `/govuk-prototype-kit-config.json` - some parts of the kit are files that prototype authors can access, we use the plugin subsystem, this configuration file is the plugin manifest
- `/index.js` - exposes the Node api of the kit

### Where tests are written

Unit tests are written next to the module being tested, as `<name>.spec.js`.

Integration tests are kept in `__tests__/spec/<name>.js`.

Acceptance tests are kept in `cypress/e2e/**/*.js`.

New features should have acceptance tests and unit tests.

### How tests are run

We use [GitHub Actions] for continuous integration.

Tests are run only for branches that have pull requests, as there are lots of them and they can take a while. We currently do have a fair bit of flakiness as well, sometimes tests will fail but pass with a re-run.

[GitHub Actions]: https://docs.github.com/en/actions
