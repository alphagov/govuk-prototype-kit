# Writing CSS

CSS used in the Prototype Kit is written in the SCSS syntax of [Sass](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax).

## Sass

Sass is an extension of CSS that gives a load of extra features useful in producing CSS for the mass of different devices and browsers.

SCSS was chosen because you can paste CSS into it without breaking it which is useful for prototyping. Using SCSS means you can also use the [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend) Sass libraries which include styles for colours, typography, cross-browser fixes and other things which are used across GOV.UK.

## Writing code

You write your Sass in [app/assets/sass](../app/assets/sass) and the Prototype Kit will compile it into the CSS used in your page (found in /public/stylesheets). The app watches your files so this will happen automatically.

There is already a CSS file included to use called [application.scss](../app/assets/sass/application.scss) which compiles into [application.css](../public/stylesheets/application.css). Note that Sass files are identified by the `.scss` extension.

Every time a change happens in [application.scss](../app/assets/sass/application.scss) it will produce a new version of [application.css](../public/stylesheets/application.css). Make sure to write your css in [application.scss](../app/assets/sass/application.scss) as anything you put in [application.css](../public/stylesheets/application.css) will get overridden.

Try starting the app and adding some styles to `application.scss`. If you open `application.css` you should now see the compiled version of those styles.

## Imports

Imports are done from either [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend/tree/master/src/) folder or the [app/assets/sass](../app/assets/sass) folder application.scss sits in. The latter means you can create your own partial files to import.

Note that the convention is to start the name of any partial with an underscore, like those in GOV.UK Frontend.
