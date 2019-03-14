# Adding CSS, JavaScript and Images

The Prototype Kit comes with standard GOV.UK Frontend styles and components for you to use in your prototypes. However if you need to add your own CSS (Cascading Style Sheets), JavaScript or images, use the `/app/assets` folder.

The Prototype Kit processes all the files in the `/app/assets` folder, and puts the processed files in `/public`.

Do not change files in the `/public` folder because it’s deleted and rebuilt every time you make a change to your prototype.

## CSS

CSS lets you change how web pages look, for example text sizes, colours or spacing.

To add styles use:

```
/app/assets/sass/application.scss
```

Do not edit the file `/public/styles/application.css` because it’s deleted and rebuilt every time you make a change to your prototype.

The Prototype Kit uses [Sass](https://sass-lang.com/guide), which adds extra features to CSS.

### Using import

If you have a very long application.scss file, you can split it up into multiple files and import those into `application.scss`. Use an underscore (_) at the start of the import file filenames, for example:

```
/app/assets/sass/_admin.scss
```

Import this file into your `application.scss` file without the underscore:

```
@import "admin";
```

## JavaScript

You can use JavaScript to make changes to a web page without loading a new one. For example a user could enter some numbers, then JavaScript displays the results of a calculation without loading a new page.

To add JavaScript use:

```
/app/assets/javascripts/application.js
```

Do not edit the file `/public/javascript/application.js` because it’s deleted and rebuilt every time you make a change to your prototype.

## Images

If you add images to `/app/assets/images` the Prototype Kit will copy them to `/public`.

For example if you add an image:

```
/app/assets/images/user.png
```

Use it in your page like this:

```
<img src="/public/images/user.png" alt="User icon">
```

Use ‘alt’ text to describe the image for screen readers.

Do not put files directly in `/public` because it’s deleted and rebuilt every time you make a change to your prototype.

## Other files

If you need to use other files in your prototype, you can add them to `/app/assets` and the Prototype Kit will copy them to `/public`. You can use sub-folders in the assets folder.

For example if you add a PDF:

```
/app/assets/downloads/report.pdf
```

Link to it like this:

```
<a href="/public/downloads/report.pdf">Download the report</a>
```
Do not put files directly in `/public` because it’s deleted and rebuilt every time you make a change to your prototype.
