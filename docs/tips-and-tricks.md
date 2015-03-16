A few useful things to help you get started.

## Adding the propositional navigation to your app

Some base HTML for the propositional navigation is included in the [views/includes](../tree/master/views/includes). You should include it as a partial in your views.

As explained in the [govuk_template readme](https://github.com/alphagov/govuk_template#propositional-title-and-navigation), you also need to include the `headerClass` tag, set to the following in your template to add that class to the `#global-header` element:

    {{$headerClass}}with-proposition{{/headerClass}}

An example of this can be seen in the [layout.html](../blob/master/views/layout.html) template.

## Adding the Alpha/Beta styling

You can add the styling for the Alpha or Beta phases by including the phase tag in your propositional navigation and adding the banner to your template.

### Adding the phase tag

The phase tag should be added to your service name in the propositional navigation. See the [propositional_navigation_alpha.html](../blob/master/views/includes/propositional_navigation_alpha.html) partial for an example.

### Adding the banner

The banner can be added using the `afterHeader` tag in your template. See [examples/alpha/alpha_layout.html](../blob/master/views/examples/alpha/alpha_layout.html) for an example.

### Adding the styles

Import the [design-patterns/_alpha-beta.scss](https://github.com/alphagov/govuk_frontend_toolkit/blob/master/stylesheets/design-patterns/_alpha-beta.scss) file from the toolkit. This will give you the `phase-banner` and `phase-tag` mixins which should give all the styles for both.

See [application.scss](../blob/master/public/sass/application.scss) for an example usage.