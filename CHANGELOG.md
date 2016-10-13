# 4.0.0

Breaking changes:

- [#244](https://github.com/alphagov/govuk_prototype_kit/pull/244) Migrate documentation into a separate application

All changes:

- Bump all GOV.UK assets to their latest versions
- Remove duplicate GOV.UK assets copied to the app
- [#241](https://github.com/alphagov/govuk_prototype_kit/pull/241) Warn against using the prototype kit to build production services
- [#268](https://github.com/alphagov/govuk_prototype_kit/pull/268) Automatically keep the latest release branch up to date. This can be used to update the kit
- [#270](https://github.com/alphagov/govuk_prototype_kit/pull/270) Add a new stylesheet for the unbranded layout to fix font issues
- [#257](https://github.com/alphagov/govuk_prototype_kit/pull/257) Make CSS output easier to debug (with sourcemaps)
- [#237](https://github.com/alphagov/govuk_prototype_kit/pull/237) Make links with role="button" behave like buttons
- [#224](https://github.com/alphagov/govuk_prototype_kit/pull/224) Lint the prototype kit’s codebase using [Standard](http://standardjs.com/). This only applies to the kit’s codebase - there’s no requirement for your app to meet this
- [#197](https://github.com/alphagov/govuk_prototype_kit/pull/197) Add the ability to store user data per session


# 3.0.0

BrowserSync support, so you don't need to refresh the browser to see your changes. Nunjucks filters file has been added, so you can [add your own filters](https://mozilla.github.io/nunjucks/api.html#custom-filters) to your project, check the examples page in the kit for more details.

Breaking changes:

- #188 Force SSL on production

All changes:

- #213 Remove references to "latest version" of Node
- #212 Remove the mustache version of govuk template
- #211 Remove govuk_template.html copied in build task from the repository
- #209 Use release 1.2.0 of the govuk-elements-sass package
- #208 Remove govuk elements sass from the app folder
- #207 Bump the govuk frontend toolkit to 4.12.0
- #206 Bump the govuk template to 0.17.3
- #200 Adds custom 'filters' to the nunjucks templating engine
- #194 Windows heroku login instructions
- #193 Adding browser-sync to the prototyping kit.
- #192 Security guidance
- #191 Edit sass docs for clarity
- #188 Force SSL on production
- #186 add guidance page for using verify prototype
- #181 Add link to styleguide on writing commit messages
- #180 Change smart quotes to straight quotes
- #177 Add a link to install Git
- #176 Bump govuk template to 0.17.0
- #175 Bump govuk frontend toolkit to 4.10.0
- #172 Fix closing </span> element
- #169 Fix broken url and typo
- #166 Stop prototypes being indexed by search engines.
- #165 Redirect .html and .htm if in url path
- #164 Fix link to developer install instructions
- #162 Have kit self-identify as being the GOV.UK Prototype kit
- #161 always convert port to Number
- #160 Minor documentation update
- #159 Remove invalid ARIA role
- #156 fix port restart issue
- #155 Update the GOV.UK template and remove napa as a dependency
- #154 Use TRAVIS_BRANCH when running in travis-ci
- #152 Amend travis yml


# 2.1.0

New documentation to make it easier to install and run from scratch - tested with users and everything! The kit will now copy new files from assets to public (previously only updates to existing files were copied). It's easier to run multiple prototypes at once - the kit will automatically find a free port to run on.

- Add default cookie message (#150)
- New documentation (#145)
- Add example pages for branching (#143)
- Use grunt-sync for assets (#141)
- Fix warning for npm engine (#140)
- Add tmuxp config files to gitignore (#132)
- Improve 'port in use' errors, find a new port (#130)

# 2.0.0

This release switches templating language from [Mustache](http://mustache.github.io/) to [Nunjucks](https://mozilla.github.io/nunjucks/).

This is a breaking change.

To convert your old prototype pages for use with this version, [follow this guide](https://github.com/alphagov/govuk_prototype_kit/blob/master/docs/updating-the-kit.md).

- Bump the govuk frontend toolkit to 4.6.0 (#127)
- Update govuk elements sass (#124)
- Update the prototype kit to use Nunjucks for templating (#123)
- Create config file that stores prototype configuration (#120)
- Add phase banner includes (#118)
- Use npm start as the standard way to run the app (#111)
- Add warning if folder missing or module missing (#100)
- Improve error handling around port in use, find new port (#95)
- Add body-parser for parsing POSTs (#86)
- Add question page (#72)
- Add js for toggled content (#70)
- Add Start Page (#45)
- Add Check Your Answers page (#36)
- Add confirmation page (#35)
- Upgraded to Express 4 (#32)
- Add jQuery to the kit, so it's available on all pages by default (#18)
- Add page without header and footer (#12)

# 1.0.0

Initial release of prototype kit
