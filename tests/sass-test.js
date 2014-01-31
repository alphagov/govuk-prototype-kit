var sass = require('node-sass');
sass.render({
    file: '../public/sass/application.scss',
    success: function(css){
        console.log(css);
    },
    error: function(error) {
        console.log(error);
    },
    includePaths: [ '../node_modules/govuk_frontend_toolkit/govuk_frontend_toolkit/stylesheets' ],
    outputStyle: 'expanded'
});