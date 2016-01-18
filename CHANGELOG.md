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
