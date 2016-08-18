# Writing CSS

CSS used in the prototype kit is written in the SCSS syntax of [Sass](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax). 

## Sass

Sass is an extension of CSS that gives a load of extra features useful in producing CSS for the mass of different devices and browsers. 

SCSS was chosen because you can paste CSS into it without breaking it which is useful for prototyping. Using SCSS means you can also use the [govuk_frontend_toolkit](https://github.com/alphagov/govuk_frontend_toolkit) Sass libraries which include styles for colours, typography, cross-browser fixes and other things which are used across GOV.UK.

## Writing code

You write your Sass in [app/assets/sass](../app/assets/sass) and the prototype kit will compile it into the CSS used in your page (found in /public/stylesheets). The app watches your files so this will happen automatically.

There is already a CSS file included to use called [application.scss](../app/assets/sass/application.scss) which compiles into [application.css](../public/stylesheets/application.css). Note that Sass files are identified by the `.scss` extension.

Every time a change happens in [application.scss](../app/assets/sass/application.scss) it will produce a new version of [application.css](../public/stylesheets/application.css). Make sure to write your css in [application.scss](../app/assets/sass/application.scss) as anything you put in [application.css](../public/stylesheets/application.css) will get overridden.

Try starting the app and adding some styles to `application.scss`. If you open `application.css` you should now see the compiled version of those styles.

## Using the govuk_frontend_toolkit

You can use the Sass libraries in the [govuk_frontend_toolkit](https://github.com/alphagov/govuk_frontend_toolkit) by importing the files from there directly into `application.scss`.

If you look at [application.scss](../app/assets/sass/application.scss) you should see some are already being used.

    @import '_typography';

    ....

    h1 {
      @include bold-48;

The line `@import '_typography';` makes all the code in [_typography.scss](https://github.com/alphagov/govuk_frontend_toolkit/blob/master/stylesheets/_typography.scss) available. The `h1` can therefore be styled in the 48pt bold form of the font by using `@include bold-48;` to call the `bold-48` mixin.

## Imports

Imports are done from either the toolkit's [stylesheets](https://github.com/alphagov/govuk_frontend_toolkit/tree/master/stylesheets/) folder or the [app/assets/sass](../app/assets/sass) folder application.scss sits in. The latter means you can create your own partial files to import. 

Note that the convention is to start the name of any partial with an underscore, like those in the toolkit.
