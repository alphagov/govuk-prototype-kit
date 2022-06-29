# Changelog

## Unreleased

### Breaking changes

- [#1432 Remove v6 backwards compatibility support](https://github.com/alphagov/govuk-prototype-kit/pull/1432)

## 12.1.1 (Fix release)

### Fixes

- [#1333: Fix _unchecked falsey value on check your answers page](https://github.com/alphagov/govuk-prototype-kit/pull/1333)

## 12.1.0 (Feature release)

### New features

- [#1328: Update to GOV.UK Frontend 4.1.0](https://github.com/alphagov/govuk-prototype-kit/pull/1328)
- [#1258: Add GOV.UK Mainstream Guide template](https://github.com/alphagov/govuk-prototype-kit/pull/1258)

## 12.0.4 (Fix release)

### Fixes

- [#1303: Fix authentication on Glitch](https://github.com/alphagov/govuk-prototype-kit/pull/1303)

## 12.0.3 (Fix release)

### Fixes

- [#1182: Replace basic auth with a custom authentication process](https://github.com/alphagov/govuk-prototype-kit/pull/1182)

## 12.0.2 (Fix release)

### Fixes

- [Pull request #1269: Replace node-sass with Dart Sass](https://github.com/alphagov/govuk-prototype-kit/pull/1269).  This should allow the kit to work on M1 Macs.

## 12.0.1 (Fix release)

### Recommended changes

The Design System team has made some changes to GOV.UK Frontend. While these are not breaking changes, implementing them will mean your prototype uses the latest components.

[Read the release notes for GOV.UK Frontend v4.0.1](https://github.com/alphagov/govuk-frontend/releases/tag/v4.0.1).

#### Remove the `tabindex` attribute from the error summary component

If you're not using Nunjucks macros, remove the `tabindex` attribute from the error summary's HTML. The component JavaScript now adds and removes this attribute.

This change was introduced in [pull request #2491: Prevent error summary from being refocused after it has been initially focused on page load](https://github.com/alphagov/govuk-frontend/pull/2491).

If you need help with the Prototype Kit, [contact the GOV.UK Prototype team](https://design-system.service.gov.uk/get-in-touch/).

## 12.0.0 (Breaking release)

### Breaking changes

This release ensures the GOV.UK Prototype Kit reflects the latest release of the GOV.UK Frontend, v4.0.0.

#### Update to GOV.UK Frontend v4.0.0

The new release of GOV.UK Frontend contains:
- an iteration to the accordion component
- other ‘breaking’ changes you should make to improve your service

Check the [GOV.UK Frontend release notes](https://github.com/alphagov/govuk-frontend/releases/tag/v4.0.0) for changes you may need to make to ensure your prototype works.

This change was added in [#1195: Update the GOV.UK Prototype Kit to use GOV.UK Frontend v4.0.0](https://github.com/alphagov/govuk-prototype-kit/pull/1195).

### New features

#### Preserve query strings when redirecting POSTs to GETs

The GOV.UK Prototype Kit now preserves URL query strings when redirecting POST requests to GET requests.

This means if you have a query like `/link/to/something?query=true&hello=world` on your POST form action, and you submit the form, the URL query string will be present in the redirected URL.

This feature is useful when you:

- use the query string to set flash messages or return paths
- want to use the values in the query string for a specific page, rather than saved data

Thanks to [@edwardhorsford](https://github.com/edwardhorsford) for contributing this issue and its solution.

This was added in [#1120: Preserve query string when redirecting POSTs to GETs](https://github.com/alphagov/govuk-prototype-kit/pull/1120).


### Fixes

- [#1155: Replace `keypather` package with `lodash.get`](https://github.com/alphagov/govuk-prototype-kit/pull/1155)

If you need help with the Prototype Kit, [contact the GOV.UK Prototype team](https://design-system.service.gov.uk/get-in-touch/).



## 11.0.0 (Fix release)

### Fixes

We’ve recently experienced 2 security incidents involving common NPM packages used by the Prototype Kit. We’re sorry for the inconvenience this has caused.

We’ve added new measures (a package-lock.json file) to help prevent this in the future.

To protect your service from any similar threats in future, please upgrade to this new version of the Kit.

[Install the Prototype Kit](https://govuk-prototype-kit.herokuapp.com/docs/install)

For any existing prototypes, follow the guide to [update the kit](https://govuk-prototype-kit.herokuapp.com/docs/updating-the-kit).

### Pull requests

[Pull request #1143: Add a package-lock.json file](https://github.com/alphagov/govuk-prototype-kit/pull/1143).


## 10.0.0 (Breaking release)

### Breaking changes

You must make the following changes if you’re running Node.js 10 and you update to this release, or your prototype may break.

### Update from Node.js 10

You can no longer run the GOV.UK Prototype Kit on Node.js 10.

If you currently run Node.js 10, you'll need to upgrade to a newer version.

We recommend using version 16. You can find more information on the [Prototype Kit requirements page](https://govuk-prototype-kit.herokuapp.com/docs/install/requirements.md).

#### Upgrade Notify client library from version 4.7.2 to 5.1.0

We have updated the Notify client library to version 5.1.0. This may break existing prototypes that are using the Notify client. Big thanks to [David McDonald](https://github.com/idavidmcdonald).

### Breaking change pull requests

- [Pull request #925: Upgrade Notify client library from 4.7.2 to 5.1.0](https://github.com/alphagov/govuk-prototype-kit/pull/925). This may break existing prototypes which are using the Notify client. If you have any issues, please [contact the GOV.UK Prototype Kit team](https://design-system.service.gov.uk/get-in-touch/).
- [Pull request #1127: Update to Node 16 and drop support for Node 10](https://github.com/alphagov/govuk-prototype-kit/pull/1127)

### Fixes

- [Pull request #1133: Remove express-writer from package file](https://github.com/alphagov/govuk-prototype-kit/pull/1133)


## 9.15.0 (Feature release)

### New features

#### Update to GOV.UK Frontend 3.14.0

Added in [Pull request #1108: Update to GOV.UK Frontend v3.14.0](https://github.com/alphagov/govuk-prototype-kit/pull/1108)

This release contains:
- new override classes for text alignment
- changes to the `govuk-spacing` function to allow negative spacing
- a fix for an accessibility issue with the panel component

#### Replace back link placeholder URLs with JavaScript

We've added JavaScript to make the [back link component](https://design-system.service.gov.uk/components/back-link/) take users to the previous page by default, rather than you having to update placeholder text.

If you want to use JavaScript in production, you must also use a non-JavaScript alternative, so you do not exclude any users. If you cannot use a non-JavaScript alternative, you should hide the back link when JavaScript is not available.

You can still override the `href` attribute if you need to provide a solution that works when JavaScript is disabled.

This was added in [Pull request #1103: Replace back link placeholder URLs with JavaScript](https://github.com/alphagov/govuk-prototype-kit/pull/1103)

#### Update Node.js to protect your code

If you use the GOV.UK Prototype Kit, we recommend you update to use the latest version of Node.js 14 Long Term Support (LTS). This is to make sure you're protected from a [recent security vulnerability in the npm (Node Package Manager)](https://github.blog/2021-09-08-github-security-update-vulnerabilities-tar-npmcli-arborist/).

To make sure you're using Node.js version 14.17.6 or later, [follow the install instructions on the Prototype Kit website](https://govuk-prototype-kit.herokuapp.com/docs/install/requirements.md#nodejs-version-14-lts).

If you're using Node Version Manager (nvm), you can instead [run `nvm install` to install v14.17.6](https://github.com/alphagov/govuk-prototype-kit/pull/1076).

### Fixes

- [Pull request #1104: Change visually hidden footer title](https://github.com/alphagov/govuk-prototype-kit/pull/1104)

## 9.14.2 (Fix release)

### Fixes

- [Pull request #1036: Update to GOV.UK Frontend v3.13.1](https://github.com/alphagov/govuk-prototype-kit/pull/1069)
- [Pull request #1050: Do not swallow errors from `session-data-defaults.js`](https://github.com/alphagov/govuk-prototype-kit/pull/1050)

## 9.14.1 (Patch release)

### Fixes

- [Pull request #1039: Run Gulp using the Node executable to fix permissions problem on GDS-managed devices](https://github.com/alphagov/govuk-prototype-kit/pull/1039)

## 9.14.0 (Feature release)

### New features

- [Pull request #1036: Update to GOV.UK Frontend v3.13.0](https://github.com/alphagov/govuk-prototype-kit/pull/1036)

## 9.13.0 (Feature release)

### New features

#### Make Sass errors clearer to users

Previously, it was not obvious to users if Sass had stopped updating because of an error. An error would be printed to the command line, but nothing would happen in the browser. We know that this error was easy to miss, which could cause confusion.

Now, when there's a Sass error, the GOV.UK Prototype Kit creates a blank `application.css` file to make the site look broken to users.

If you fix the Sass error, the site will automatically reload.

We have also changed the [Gulp](https://www.npmjs.com/package/gulp-sass) log level to be less detailed, so that errors stand out.

This was added in [Pull request #990: Make Sass errors clearer to the user](https://github.com/alphagov/govuk-prototype-kit/pull/990).

#### Opt in to the new GOV.UK Frontend link styles

Links now have underlines that are consistently thinner and a bit further away from the link text.

Links also have a clearer hover state, where the underline gets thicker to make the link stand out to users.

The new link styles are opt-in because [Chromium browsers have an issue with links inside a multi-column layout](https://github.com/alphagov/govuk-frontend/issues/2204).

Read more about the new link styles in the [GOV.UK Frontend release notes](https://github.com/alphagov/govuk-frontend/releases).

This was added in [Pull request #1012: Implement the new link and hover styles in the Prototype Kit](https://github.com/alphagov/govuk-prototype-kit/issues/1012).

#### Update to GOV.UK Frontend
This was added in [Pull request #1025: Update to GOV.UK Frontend v3.12.0](https://github.com/alphagov/govuk-prototype-kit/pull/1025)

### Fixes

- [Pull request #995: Allow Node 15 to be used](https://github.com/alphagov/govuk-prototype-kit/pull/995)

## 9.12.1 (Patch release)

### Fixes

- [Pull request #987: Import the cookie banner macro as part of the layout](https://github.com/alphagov/govuk-prototype-kit/pull/987)

## 9.12.0 (Feature release)

### New features

- [Pull request #985: Update to GOV.UK Frontend v3.11.0](https://github.com/alphagov/govuk-prototype-kit/pull/985)

### Fixes

- [Pull request #983: Remove the outdated 'GOV.UK uses cookies to make the site simpler' cookie banner](https://github.com/alphagov/govuk-prototype-kit/pull/983)

## 9.11.2 (Patch release)

### Fixes

- [Pull request #971: Update to GOV.UK Frontend v3.10.1](https://github.com/alphagov/govuk-prototype-kit/pull/971)

## 9.11.1 (Patch release)

### Fixes

- [Pull request #966: Import the notification banner macro as part of the layout](https://github.com/alphagov/govuk-prototype-kit/pull/966)

## 9.11.0 (Feature release)

### New features

- [Pull request #962: Update to GOV.UK Frontend v3.10.0](https://github.com/alphagov/govuk-prototype-kit/pull/962)

### Fixes

- [Pull request #938: Update Marked module to fix security issue](https://github.com/alphagov/govuk-prototype-kit/pull/938)
- [Pull request #944: Disable Browsersync ghostMode to stop interactions being mirrored across tabs and devices](https://github.com/alphagov/govuk-prototype-kit/pull/944)
- [Pull request #948: Fix Sass files being copied to public directory](https://github.com/alphagov/govuk-prototype-kit/pull/948)

## 9.10.1 (Patch release)

- [Pull request #936: Update to GOV.UK Frontend v3.9.1](https://github.com/alphagov/govuk-prototype-kit/pull/936)

## 9.10.0 (Feature release)

### New features

- [Pull request #928: Update to GOV.UK Frontend v3.9.0](https://github.com/alphagov/govuk-prototype-kit/pull/928)

## 9.9.0 (Feature release)

### New features

- [Pull request #908: Update to GOV.UK Frontend v3.8.0](https://github.com/alphagov/govuk-prototype-kit/pull/919)

### Fixes

- [Pull request #913: Fix security issue when running on Glitch](https://github.com/alphagov/govuk-prototype-kit/pull/913)

## 9.8.0 (Feature release)

### New features

#### Updated task list template

The task list pattern has been updated to make incomplete tasks clearer to users. This change [has also been made to the pattern in the Design System](https://design-system.service.gov.uk/patterns/task-list-pages/).

If you're updating from an older version, in your `app/assets/sass/patterns/task-list.scss` file add the line `.app-task-list__tag,` before `.app-task-list__task-completed {`:

```scss
.app-task-list__tag,
.app-task-list__task-completed {
```

This was added in [pull request #907: Update Task List template](https://github.com/alphagov/govuk-prototype-kit/pull/907)

## 9.7.0 (Feature release)

### New features

- [Pull request #901: Add support for Node v14](https://github.com/alphagov/govuk-prototype-kit/pull/901)
- [Pull request #908: Update to GOV.UK Frontend v3.7.0](https://github.com/alphagov/govuk-prototype-kit/pull/908)

## 9.6.1 (Patch release)

### Fixes

- [Pull request #884: Bump nunjucks from v3.1.3 to v3.2.1](https://github.com/alphagov/govuk-prototype-kit/pull/884)
- [Pull request #885: Update various dependencies and fix linting offences](https://github.com/alphagov/govuk-prototype-kit/pull/885)

## 9.6.0 (Feature release)

### New features

- [Pull request #879: Update to GOV.UK Frontend v3.6.0](https://github.com/alphagov/govuk-prototype-kit/pull/879)

## 9.5.0 (Feature release)

### New features

- [Pull request #852: Update to GOV.UK Frontend v3.5.0](https://github.com/alphagov/govuk-prototype-kit/pull/852).

### Fixes

#### Use Prototype Kit-specific patterns in the unbranded template

You can now use patterns like [step by step navigation](https://govuk-prototype-kit.herokuapp.com/docs/templates/step-by-step-navigation) and [task lists](https://govuk-prototype-kit.herokuapp.com/docs/templates/task-list) in the [unbranded template](https://govuk-prototype-kit.herokuapp.com/docs/templates/blank-unbranded).

You do not need to do anything if you're installing this version for the first time.

If you're upgrading from an older version, make the following changes.

1. In the `app/assets/sass/unbranded.scss` file, change `@import "node_modules/govuk-frontend/govuk/all";` to `@import "application";`.
2. In the `app/views/layout_unbranded.html` file, change `{% extends "govuk/template.njk" %}` to `{% extends "layout.html" %}`.

[#842: Allow Kit specific patterns to be used with the unbranded template](https://github.com/alphagov/govuk-prototype-kit/pull/842).

#### Other fixes

- [Pull request #840: Update Kit to use latest active LTS Node.js version 12.x](https://github.com/alphagov/govuk-prototype-kit/pull/840).
- [Pull request #847: Update step by step patterns to latest](https://github.com/alphagov/govuk-prototype-kit/pull/847).

## 9.4.0 (Feature release)

### New features

- [Pull request #837: Update GOV.UK Frontend to version 3.4.0](https://github.com/alphagov/govuk-prototype-kit/pull/837).

### Fixes

- [Pull request #815: Prevent exceptions thrown from 'compatibility mode' routes from being silently caught, disabling compatibility mode](https://github.com/alphagov/govuk-prototype-kit/pull/815).

## 9.3.0 (Feature release)

### New features

- [Pull request #814: Update GOV.UK Frontend to version 3.3.0](https://github.com/alphagov/govuk-prototype-kit/pull/814).

## 9.2.0 (Feature release)

### New features

- [Pull request #800: Update GOV.UK Frontend to version 3.2.0](https://github.com/alphagov/govuk-prototype-kit/pull/800).

## 9.1.0 (Feature release)

### New features

- [Pull request #797: Update GOV.UK Frontend to version 3.1.0](https://github.com/alphagov/govuk-prototype-kit/pull/797).

### Fixes

- [Pull request #796: Update focus states on step-by-step navigation](https://github.com/alphagov/govuk-prototype-kit/pull/796).

## 9.0.0 (Breaking release)

This release updates GOV.UK Prototype Kit to v3.0.0 of GOV.UK Frontend.

In v3.0.0 of GOV.UK Frontend, we’ve made some important changes to [improve the accessibility of pages](https://designnotes.blog.gov.uk/2019/07/29/weve-made-the-gov-uk-design-system-more-accessible). This includes making sure that the styles, components and patterns in GOV.UK Frontend meet [WCAG 2.1 level AA](https://www.w3.org/TR/WCAG21/).

You must follow our [guidance on updating your version of the Prototype Kit](https://govuk-prototype-kit.herokuapp.com/docs/updating-the-kit).

If you need help updating or installing the Prototype Kit, you can:

- [contact the GOV.UK Design System team](https://design-system.service.gov.uk/get-in-touch/)
- talk to a developer on your team

### Breaking changes

You must make the following changes when you migrate to this release, or your prototype may break.

1. Update files in the `/app` folder - unless you [updated via the command line](https://govuk-prototype-kit.herokuapp.com/docs/updating-the-kit#updating-via-the-command-line-advanced-).
2. Update HTML in GOV.UK Frontend components.

If you’ve created custom code or components, read the [release notes for GOV.UK Frontend v3.0.0](https://github.com/alphagov/govuk-frontend/releases/tag/v3.0.0) for more changes you may need to make.

#### Update files in the app folder

To make sure GOV.UK Frontend's files do not conflict with your code, we've moved our package files into a directory called `govuk`.

If you [downloaded this version of the Prototype Kit as a zip file](https://govuk-prototype-kit.herokuapp.com/docs/updating-the-kit#steps), you must:

- add an assets path in the Sass file
- replace old colours
- update asset paths
- update the layout file
- update the layout_unbranded file

Pull requests:

- [#1458: Namespace nunjucks and components](https://github.com/alphagov/govuk-frontend/pull/1458)
- [#1467: Update the main entry point in package.json](https://github.com/alphagov/govuk-frontend/pull/1467)

#### Add an assets path in the Sass file

In the `app/assets/sass/application.scss` file, add `$govuk-assets-path: '/govuk/assets/';` at the top.

#### Replace old colours

In the `app/assets/sass/patterns/_step-by-step-navigation.scss` file, replace:

- `“grey-4”` with `"light-grey", $legacy: "grey-4"`
- `“grey-3”` with `"light-grey", $legacy: "grey-3"`

You must make this change even if you are not using the step by step navigation pattern in your prototype.

Read our [blog post about why we changed the colour palette](https://designnotes.blog.gov.uk/2019/07/29/weve-updated-the-gov-uk-colours-and-font/).

#### Update asset paths

In the `app/assets/sass/unbranded.scss` file, add `govuk/` after `govuk-frontend/` in the 3 `@import` paths. For example:

```scss
@import "node_modules/govuk-frontend/govuk/settings/colours-palette";
```

#### Update the layout file

1. Go to the `app/views/layout.html` file.
2. Add `{%- set assetPath = '/govuk/assets' -%}` at the top.
3. Replace `{% extends "template.njk" %}` with `{% extends "govuk/template.njk" %}`.
4. In each import line that starts `{% from`, add `govuk/components/` to the start of the file path. For example:

```javascript
{% from "govuk/components/accordion/macro.njk"        import govukAccordion %}
```

5. Add `{% set mainClasses = mainClasses | default("govuk-main-wrapper--auto-spacing") %}` before `{% if useAutoStoreData %}`

#### Update the layout_unbranded file

In the `app/views/layout_unbranded.html` file:

1. Add `{%- set assetPath = '/govuk/assets' -%}` at the top.
2. Replace `{% extends "template.njk" %}` with `{% extends "govuk/template.njk" %}`.

[Pull request #769: Update to GOV.UK Frontend 3.0.0.](https://github.com/alphagov/govuk-prototype-kit/pull/769/files)

#### Update HTML in GOV.UK Frontend components

##### Update and add data-module attributes

If you’re using HTML versions of GOV.UK Frontend components, add a `govuk-` prefix to `data-module` attribute values. For example:

```html
<div class="govuk-accordion" data-module="govuk-accordion">
...
</div>
```

If you’re using HTML versions of the button or details component, add:

- `data-module="govuk-button"` to each `<button>` HTML tag
- `data-module="govuk-details"` to each `<details>` HTML tag

[Pull request #1443: Ensure GOV.UK Frontend component selectors cannot conflict when initialised.](https://github.com/alphagov/govuk-frontend/pull/1443)

#### Update the character count CSS class name

If you're using the HTML version of the character count component, change `js-character-count` to `govuk-js-character-count`.

[Pull request #1444: Renames `js-` css prefix to `govuk-js-`.](https://github.com/alphagov/govuk-frontend/pull/1444)

#### Update links from error summary components to radios and checkboxes

If you've linked from an error summary component to the first input in a [radios](https://design-system.service.gov.uk/components/radios/) or [checkboxes](https://design-system.service.gov.uk/components/checkboxes/) component, the link will no longer work.

This is because the `id` of the first input no longer has the suffix `-1`.

If there are links back to radios or checkboxes components in your error summary component, remove `-1` from the end of the `href` attribute.

[Pull request #1426: Make radios and checkboxes components easier to link to from error summary.](https://github.com/alphagov/govuk-frontend/pull/1426)

#### Update markup if you’re using the tab component

If you’re using the HTML version of the tabs component, remove the `govuk-tabs__tab--selected` class from the first tab's link, then add the `govuk-tabs__list-item--selected` class to the link's parent list item.

For example:

```html
<li class="govuk-tabs__list-item govuk-tabs__list-item--selected">
  <a class="govuk-tabs__tab" href="#tab1">
    Tab 1
  </a>
</li>
```

[Pull request #1496: Update the focus state for tabs.](https://github.com/alphagov/govuk-frontend/pull/1443)

#### Update markup if you’re using the task list component

Update every item in your task list, removing the `app-task-list__task-name` class from the link and wrapping the link in a new `<span class="app-task-list__task-name">`.


For example:

 ```html
<li class="app-task-list__item">
  <span class="app-task-list__task-name">
    <a href="#" aria-describedby="eligibility-completed">
      Check eligibility
    </a>
  </span>
</li>
```

[Pull request #770: Update the task list focus state.](https://github.com/alphagov/govuk-prototype-kit/pull/770)

#### Update start button icon

[Start buttons](https://design-system.service.gov.uk/components/button/#start-buttons) have a new icon. Your start buttons will lose their current icons unless you replace the old icon with the new one.

If you're using Nunjucks:

- set the `isStartButton` option to `true`
- remove the `.govuk-button--start` class

For example:

```javascript
govukButton({
  text: "Start now",
  href: "#",
  isStartButton: true
})
```

If you're using HTML, add the SVG code from the [start button example in the Design System](https://design-system.service.gov.uk/components/button/#start-buttons).

[Pull request #1341: Add new start button icon.](https://github.com/alphagov/govuk-frontend/pull/1341)

### New features

#### Page wrappers now use auto spacing

The `<main>` element in layouts now has a `.govuk-main-wrapper--auto-spacing` class by default.

This will add the correct amount of padding above the content, depending on whether there are elements above the `<main>` element inside the `govuk-width-container` wrapper. Elements above the `<main>` element could include a back link or breadcrumb component.

If `govuk-main-wrapper--auto-spacing` does not work for your service, you can set the correct amount of padding by adding the `.govuk-main-wrapper--l` class to your page or layout by using:

 ```js
{% set mainClasses = "govuk-main-wrapper--l" %}
```

You can also turn off the `.govuk-main-wrapper--auto-spacing` class by using:

 ```js
{% set mainClasses = "" %}
```

#### Continue to use the old colours

If you want to continue using old colours in your prototype, you can [turn on compatibility mode](https://github.com/alphagov/govuk-frontend/blob/master/docs/installation/compatibility.md).

## 8.12.1

## Fixes

- [#763 Fix a Sass compilation error in the unbranded stylesheet](https://github.com/alphagov/govuk-prototype-kit/pull/763), which was introduced in 8.12.0.

## 8.12.0

### New feature

- [#760 Update to GOV.UK Frontend version 2.12.0](https://github.com/alphagov/govuk-prototype-kit/pull/760) (See GOV.UK Frontend 2.12.0 [release notes](https://github.com/alphagov/govuk-frontend/releases/tag/v2.12.0))

### Fixes

- [#751 Remove unnecessary settings import from the 'unbranded' stylesheet](https://github.com/alphagov/govuk-prototype-kit/pull/752)

## 8.11.0

### New feature

- [#741 Update to GOV.UK Frontend version 2.11.0](https://github.com/alphagov/govuk-prototype-kit/pull/741) (See GOV.UK Frontend 2.11.0 [release notes](https://github.com/alphagov/govuk-frontend/releases/tag/v2.11.0))

## 8.10.0

### New feature

- [#722 Update to GOV.UK Frontend version 2.10.0](https://github.com/alphagov/govuk-prototype-kit/pull/722) (See GOV.UK Frontend 2.10.0 [release notes](https://github.com/alphagov/govuk-frontend/releases/tag/v2.10.0))

## 8.9.0

### New feature

- [#713 Bump GOV.UK Frontend to v2.9.0](https://github.com/alphagov/govuk-prototype-kit/pull/713).

### Fixes

- [#697 Only ask for usage permission if TTY](https://github.com/alphagov/govuk-prototype-kit/pull/697). Thanks [zuzak](https://github.com/zuzak) for this contribution.
- [#712 Turn off npm default auditing](https://github.com/alphagov/govuk-prototype-kit/pull/712).

## 8.8.0

### New features

- [#701 Update to GOV.UK Frontend version 2.8.0](https://github.com/alphagov/govuk-prototype-kit/pull/701) (See GOV.UK Frontend 2.8.0 [release notes](https://github.com/alphagov/govuk-frontend/releases/tag/v2.8.0)).

## 8.7.0

### New features

- [#613 Update to GOV.UK Frontend version 2.7.0 and adds experimental extensions feature](https://github.com/alphagov/govuk-prototype-kit/pull/613) (See GOV.UK Frontend 2.7.0 [release notes](https://github.com/alphagov/govuk-frontend/releases/tag/v2.7.0)). Big thanks @matcarey (https://github.com/matcarey)
  As this is an **experimental** feature it should be used at your own risk, and is likely to change. Please contact us if you're interested in trying it out.

- [#687 Update docs and package.json to Node 10 LTS](https://github.com/alphagov/govuk-prototype-kit/pull/687)

- [#683 add guidance for CSS, JavaScript and images](https://github.com/alphagov/govuk-prototype-kit/pull/683)

## 8.6.0

### New features

- [#680 Update to GOV.UK Frontend version 2.6.0](https://github.com/alphagov/govuk-prototype-kit/pull/680) (See GOV.UK Frontend 2.6.0 [release notes](https://github.com/alphagov/govuk-frontend/releases/tag/v2.6.0))

## 8.5.0

### New features

- [#672 Replace ‘check answers’ pattern with updated code](https://github.com/alphagov/govuk-prototype-kit/pull/672)
- [#671 Update to GOV.UK Frontend version 2.5.0](https://github.com/alphagov/govuk-prototype-kit/pull/671)
   Allows use of new components Accordion and Summary List

### Fixes

- [#667 Add acorn dependency to fix npm warning](https://github.com/alphagov/govuk-prototype-kit/pull/667)
- [#647 Fix link context in step-by-step templates](https://github.com/alphagov/govuk-prototype-kit/pull/647)

### Internal

- [#663 update Standard to 12.0.1](https://github.com/alphagov/govuk-prototype-kit/pull/663)
- [#640 Replace Mocha with Jest](https://github.com/alphagov/govuk-prototype-kit/pull/640)
- [#659 Upgrade kit to use Gulp 4](https://github.com/alphagov/govuk-prototype-kit/pull/659)
- [#664 Remove deprecated gulp-util](https://github.com/alphagov/govuk-prototype-kit/pull/664)

## 8.4.0

### New features

- [#642 Update GOV.UK Frontend to v2.4.0](https://github.com/alphagov/govuk-prototype-kit/pull/642)

### Bug fixes

- [#634 Avoid double-nested buttons in step-by-step navigation](https://github.com/alphagov/govuk-prototype-kit/pull/634)

- [#638 Make unbranded template available for use in app/views](https://github.com/alphagov/govuk-prototype-kit/pull/638)

## 8.3.0

### New features

- [#628 Update GOV.UK Frontend to v2.3.0](https://github.com/alphagov/govuk-prototype-kit/pull/628)

- [#574 Add Notify integration guidance](https://github.com/alphagov/govuk-prototype-kit/pull/574)

- [Add npm install reminder when prototype crashes](https://github.com/alphagov/govuk-prototype-kit/pull/598)

- [#539 Add step by step navigation](https://github.com/alphagov/govuk-prototype-kit/pull/539)

## 8.2.0

### New features

- [#609 Update GOV.UK Frontend to v2.2.0](https://github.com/alphagov/govuk-prototype-kit/pull/609)

Also includes a new character-count component

### Bug fixes

- [#605 Set stylesheet media to "all" to allow print styles](https://github.com/alphagov/govuk-prototype-kit/pull/605)

- [#608 Clearing session data now uses a POST request rather than a destructive GET request](https://github.com/alphagov/govuk-prototype-kit/pull/608)

## 8.1.0

### New features

- [#600 Update GOV.UK Frontend to v2.1.0](https://github.com/alphagov/govuk-prototype-kit/pull/600)

## 8.0.0

### Breaking change

- [#595 Update GOV.UK Frontend to v2.0.0](https://github.com/alphagov/govuk-prototype-kit/pull/595)

### New features

- [Add config to allow permanent session in cookie](https://github.com/alphagov/govuk-prototype-kit/pull/593)
- [Allow nested field values in session](https://github.com/alphagov/govuk-prototype-kit/pull/573)
- [Restart the app if environment variables change](https://github.com/alphagov/govuk-prototype-kit/pull/389)
- [Make it more difficult to accidentally clear the session data](https://github.com/alphagov/govuk-prototype-kit/pull/588)


### Bug fixes

- [Use path to gulp executable for spawn](https://github.com/alphagov/govuk-prototype-kit/pull/479)

## 7.1.0

### New features

- [Update GOV.UK Frontend to v1.3.0](https://github.com/alphagov/govuk-prototype-kit/pull/581)
- [Rename and reorganise template pages to be easier to use](https://github.com/alphagov/govuk-prototype-kit/pull/578)
- [Add kit version and link to footer](https://github.com/alphagov/govuk-prototype-kit/pull/476)

### Bug fixes

- [Fix loading variables from .env](https://github.com/alphagov/govuk-prototype-kit/pull/583)
- [Update link from question page template to design system](https://github.com/alphagov/govuk-prototype-kit/pull/575)
- [Changed block name to bodyEnd to fix scripts in unbranded template](https://github.com/alphagov/govuk-prototype-kit/pull/580)

## 7.0.0

This release adds backwards compatibility, so you can use old prototypes made in v6 of the Prototype Kit in v7.

[Read the guidance on using backwards compatibility](https://govuk-prototype-kit.herokuapp.com/docs/backwards-compatibility)

### New features

- [#568 Update GOV.UK Frontend to 1.2.0](https://github.com/alphagov/govuk-prototype-kit/pull/568)
- [#563 Add Nunjucks macro example to 'passing data' guidance](https://github.com/alphagov/govuk-prototype-kit/pull/563)
- [#553 Add backwards compatibility - support for prototypes made in Version 6 of the Prototype Kit](https://github.com/alphagov/govuk-prototype-kit/pull/553)
- [#557 Bump outdated dependencies](https://github.com/alphagov/govuk-prototype-kit/pull/557):
  - Update standard from 10.0.2 to 11.0.1 and fix violations
  - Update run-sequence from 1.2.2 to 2.2.1
  - Update require-dir from 0.3.2 to 1.0.0
  - Update notifications-node-client from 3.0.0 to 4.1.0
  - Update marked from 0.3.6 to 0.4.0
  - Update gulp-sass from 3.1.0 to 4.0.1
  - Update gulp-mocha from v4.3.1 to v6.0.0
  - Update gulp-clean from 0.3.2 to 0.4.0
  - Update express from 4.15.2 to 4.16.3
  - Update dotenv from 4.0.0 to 6.0.0
  - Update cross-spawn from 5.0.0 to 6.0.5
  - Update basic-auth from 1.0.3 to 2.0.0
- [#557 Remove unused readdir dependency](https://github.com/alphagov/govuk-prototype-kit/pull/557)
- [#557 Fix a broken link in an error message](https://github.com/alphagov/govuk-prototype-kit/pull/557)

### Bug fixes
- [#566 Improve error handling](https://github.com/alphagov/govuk-prototype-kit/pull/566)
- [#556 Update branching example](https://github.com/alphagov/govuk-prototype-kit/pull/556)
- [#536 Import missing component macros](https://github.com/alphagov/govuk_prototype_kit/pull/536)
- [#532 Update repo links from govuk_prototype_kit to govuk-prototype-kit](https://github.com/alphagov/govuk_prototype_kit/pull/532)
- [#540 Fix grid css classes on check-your-answers page](https://github.com/alphagov/govuk-prototype-kit/pull/540)
- [#562 Change the syntax used to specify node engine versions to fix a bug that prevented prototypes from being deployed to a CloudFoundry instance, by ](https://github.com/alphagov/govuk-prototype-kit/pull/562)

## 7.0.0-beta.10

### Breaking changes

- [#512 Update to GOV.UK Frontend](https://github.com/alphagov/govuk_prototype_kit/pull/512)

You will need to:

- update `app/views/includes/scripts.html` file and add the following line to include the JavaScript file
```
<script src="/node_modules/govuk-frontend/all.js"></script>
```
- modify `app/assets/javascripts/application.js` file to initialise the JavaScript
```
$(document).ready(function () {
   window.GOVUKFrontend.initAll()
})
```

### New features

- [#501 Add default session data](https://github.com/alphagov/govuk_prototype_kit/pull/501)
- [#502 Add Cookies and Privacy policy text](https://github.com/alphagov/govuk_prototype_kit/pull/502)
- [#521 Do not track users who have enabled 'DoNotTrack'](https://github.com/alphagov/govuk_prototype_kit/pull/521)
- [#522 Add inline-code block styles](https://github.com/alphagov/govuk_prototype_kit/pull/522)
- [#523 Track app usage](https://github.com/alphagov/govuk_prototype_kit/pull/523)
- [#525 Add design system message to home page](https://github.com/alphagov/govuk_prototype_kit/pull/525)

### Bug fixes

- [#530 Update elements class to frontend on examples page](https://github.com/alphagov/govuk_prototype_kit/pull/530)
- [#491 Remove redundant Google Analytics](https://github.com/alphagov/govuk_prototype_kit/pull/491)
- [#524 Make "Prototype Kit" casing consistent](https://github.com/alphagov/govuk_prototype_kit/pull/524)
- [#527 Update docs/index page to include same information as private beta](https://github.com/alphagov/govuk_prototype_kit/pull/527)

To see the previous private beta releases see the archived [private beta repository](https://github.com/alphagov/govuk-prototype-kit-private-beta/blob/master/CHANGELOG.md#700-beta9).

## 6.3.0

### New features

- [#430 Recommend Atom over Sublime text](https://github.com/alphagov/govuk_prototype_kit/pull/430)
- [#415 Update to govuk-elements-sass v3.1.1](https://github.com/alphagov/govuk_prototype_kit/pull/415)
- [#422 fix(package): update govuk_template_jinja to version 0.22.3](https://github.com/alphagov/govuk_prototype_kit/pull/422)
- [#401 Update govuk_template_jinja to 0.22.2](https://github.com/alphagov/govuk_prototype_kit/pull/401)
- [#409 Update govuk_frontend_toolkit to 7.0.0](https://github.com/alphagov/govuk_prototype_kit/pull/409)
- [#406 Add documentation for creating a release](https://github.com/alphagov/govuk_prototype_kit/pull/406)
- [#410 Copyright should be Crown Copyright](https://github.com/alphagov/govuk_prototype_kit/pull/410)
- [#407 Support deprecated check-your-answers table styles](https://github.com/alphagov/govuk_prototype_kit/pull/407)

### Bug fixes

- [#431 Remove the Heroku deploy provider from Travis](https://github.com/alphagov/govuk_prototype_kit/pull/431)
- [#405 Upgrade node.js version for Heroku](https://github.com/alphagov/govuk_prototype_kit/pull/405)

## 6.2.0

### New features
- [#365 Improvements to Check your answers page](https://github.com/alphagov/govuk_prototype_kit/pull/365)
- [#398 Bump govuk_template_jinja to 0.22.1](https://github.com/alphagov/govuk_prototype_kit/pull/398)

### Bug fixes
- [#405 Upgrade node.js version for Heroku](https://github.com/alphagov/govuk_prototype_kit/pull/405)
- [#399 Fix JS error in Safari’s Private Browsing mode](https://github.com/alphagov/govuk_prototype_kit/pull/399)

## 6.1.0

### New features

- [#386 Add GOV.UK Notify client library to kit](https://github.com/alphagov/govuk_prototype_kit/pull/386)
- [#383 Add .env file to support storing private data](https://github.com/alphagov/govuk_prototype_kit/pull/383)
- [#347 Add ie8 elements support](https://github.com/alphagov/govuk_prototype_kit/pull/347)
- [#349 Add IE 8 bind polyfill](https://github.com/alphagov/govuk_prototype_kit/pull/349)
- [#373 add page_scripts block](https://github.com/alphagov/govuk_prototype_kit/pull/373)
- [#371 Update README](https://github.com/alphagov/govuk_prototype_kit/pull/371)

## 6.0.0

### New features

- [#369 Add template pages for content and questions](https://github.com/alphagov/govuk_prototype_kit/pull/369)
- [#340 Auto data session 4](https://github.com/alphagov/govuk_prototype_kit/pull/340)
- [#367 Added config to turn off browser sync](https://github.com/alphagov/govuk_prototype_kit/pull/367)
- [#368 Update Travis deployment to be consistent with other govuk frontend repos](https://github.com/alphagov/govuk_prototype_kit/pull/368)
- [#361 Add an example of the task list pattern](https://github.com/alphagov/govuk_prototype_kit/pull/361)
- [#364 Use GOV.UK elements v3.0.1](https://github.com/alphagov/govuk_prototype_kit/pull/364)
- [#360 Bump govuk_frontend_toolkit to 5.1.1](https://github.com/alphagov/govuk_prototype_kit/pull/360)
- [#352 bump gulp-sass to increase node-sass dependency](https://github.com/alphagov/govuk_prototype_kit/pull/352)

### Bug fixes

- [#356 fix download link](https://github.com/alphagov/govuk_prototype_kit/pull/356)
- [#357 fix docs links](https://github.com/alphagov/govuk_prototype_kit/pull/357)
- [#354 Allow search indexing in promo mode](https://github.com/alphagov/govuk_prototype_kit/pull/354)

## 5.1.0

### New features

- [#335 Add ability to override service name on a page](https://github.com/alphagov/govuk_prototype_kit/pull/335)

### Bug fixes

- [#350 Prevent asking users to authenticate twice](https://github.com/alphagov/govuk_prototype_kit/pull/350)
- [#344 Removing links to route.js / updating example in branching.html](https://github.com/alphagov/govuk_prototype_kit/pull/344)
- [#343 Remove the title attribute from the cookie message](https://github.com/alphagov/govuk_prototype_kit/pull/343)
- [#341 fix css sourcemaps](https://github.com/alphagov/govuk_prototype_kit/pull/341)
- [#337 Add Git step to Heroku guide](https://github.com/alphagov/govuk_prototype_kit/pull/337)
- [#336 Use app.locals instead of app.use](https://github.com/alphagov/govuk_prototype_kit/pull/336)

## 5.0.1

- [#330 Update GOV.UK toolkit and StandardJS to latest](https://github.com/alphagov/govuk_prototype_kit/pull/330)
- [#328 Update GOV.UK template to latest](https://github.com/alphagov/govuk_prototype_kit/pull/328)
- [#324 Fix the example question page’s back link](https://github.com/alphagov/govuk_prototype_kit/pull/324)

## 5.0.0

### Breaking changes

- [#284 Use Gulp instead of Grunt](https://github.com/alphagov/govuk_prototype_kit/pull/284)

Use [Gulp.js](http://gulpjs.com/) rather than [Grunt](http://gruntjs.com/) as a build tool.
It is recommended to [install Gulp globally](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md), do so using:

`npm install --global gulp-cli`

### All changes

The short version:

- [#311 Update govuk-elements-sass to 2.2.0](https://github.com/alphagov/govuk_prototype_kit/pull/311)
- [#308 Change node version from 4 to 6](https://github.com/alphagov/govuk_prototype_kit/pull/308)
- [#299 Basic sanity check test suite](https://github.com/alphagov/govuk_prototype_kit/pull/299)
- [#296 Keep the latest release branch up-to-date](https://github.com/alphagov/govuk_prototype_kit/pull/296)
- Fix broken links for the documentation app

The extended version:

This release includes custom radio buttons and checkbox styles from govuk-elements-sass v2.2.0.
The version of Node that the prototype kit uses has been updated, we recommend using LTS (version 6 or above).
Travis will now run tests against each pull request to ensure that the app runs (by checking the server and build tasks).
The latest-release branch can be used to update the prototype kit. Instructions for [updating your version of the prototype kit via the latest-release branch can be found here](https://govuk-prototype-kit.herokuapp.com/docs/updating-the-kit#updating-via-the-command-line-advanced-).

## 4.0.0

### Breaking changes

- [#244](https://github.com/alphagov/govuk_prototype_kit/pull/244) Migrate documentation into a separate application

### All changes

- Bump all GOV.UK assets to their latest versions
- Remove duplicate GOV.UK assets copied to the app
- [#241](https://github.com/alphagov/govuk_prototype_kit/pull/241) Warn against using the prototype kit to build production services
- [#268](https://github.com/alphagov/govuk_prototype_kit/pull/268) Automatically keep the latest release branch up to date. This can be used to update the kit
- [#270](https://github.com/alphagov/govuk_prototype_kit/pull/270) Add a new stylesheet for the unbranded layout to fix font issues
- [#257](https://github.com/alphagov/govuk_prototype_kit/pull/257) Make CSS output easier to debug (with sourcemaps)
- [#237](https://github.com/alphagov/govuk_prototype_kit/pull/237) Make links with role="button" behave like buttons
- [#224](https://github.com/alphagov/govuk_prototype_kit/pull/224) Lint the prototype kit’s codebase using [Standard](http://standardjs.com/). This only applies to the kit’s codebase - there’s no requirement for your app to meet this
- [#197](https://github.com/alphagov/govuk_prototype_kit/pull/197) Add the ability to store user data per session


## 3.0.0

BrowserSync support, so you don't need to refresh the browser to see your changes. Nunjucks filters file has been added, so you can [add your own filters](https://mozilla.github.io/nunjucks/api.html#custom-filters) to your project, check the examples page in the kit for more details.

### Breaking changes

- #188 Force SSL on production

### All changes

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


## 2.1.0

New documentation to make it easier to install and run from scratch - tested with users and everything! The kit will now copy new files from assets to public (previously only updates to existing files were copied). It's easier to run multiple prototypes at once - the kit will automatically find a free port to run on.

- Add default cookie message (#150)
- New documentation (#145)
- Add example pages for branching (#143)
- Use grunt-sync for assets (#141)
- Fix warning for npm engine (#140)
- Add tmuxp config files to gitignore (#132)
- Improve 'port in use' errors, find a new port (#130)

## 2.0.0

This release switches templating language from [Mustache](http://mustache.github.io/) to [Nunjucks](https://mozilla.github.io/nunjucks/).

### Breaking change

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

## 1.0.0

Initial release of prototype kit
