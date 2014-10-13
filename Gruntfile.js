module.exports = function(grunt){
  grunt.initConfig({
    // Clean
    clean: ['public', 'govuk_modules'],

    // Builds Sass
    sass: {
      dev: {
        options: {
          style: "expanded",
          sourcemap: true,
          includePaths: [
            'govuk_modules/govuk_template/assets/stylesheets',
            'govuk_modules/govuk_frontend_toolkit/stylesheets'
          ]
        },
        files: [{
          expand: true,
          cwd: "app/assets/sass",
          src: ["*.scss"],
          dest: "public/stylesheets/",
          ext: ".css"
        }]
      }
    },

    // Copies templates and assets from external modules and dirs
    copy: {

      govuk_frontend_toolkit: {
        cwd: 'node_modules/govuk_frontend_toolkit/govuk_frontend_toolkit',
        src: '**',
        dest: 'govuk_modules/govuk_frontend_toolkit/',
        expand: true
      },

      govuk_template: {
        cwd: 'node_modules/govuk_template_mustache/',
        src: '**',
        dest: 'govuk_modules/govuk_template/',
        expand: true
      },

      template_css: {
        cwd: 'node_modules/govuk_template_mustache/assets/stylesheets/',
        src: '**',
        dest: 'public/stylesheets/',
        expand: true
      },

      assets_js: {
        cwd: 'app/assets/javascripts/',
        src: '**/*',
        dest: 'public/javascripts/',
        expand: true
      },

      toolkit_js: {
        cwd: 'node_modules/govuk_frontend_toolkit/govuk_frontend_toolkit/javascripts/',
        src: ['govuk/selection-buttons.js', 'vendor/polyfills/bind.js'],
        dest: 'public/javascripts/',
        expand: true
      },

      template_js: {
        cwd: 'node_modules/govuk_template_mustache/assets/javascripts/',
        src: '**',
        dest: 'public/javascripts/',
        expand: true
      },

      toolkit_images: {
        cwd: 'node_modules/govuk_frontend_toolkit/govuk_frontend_toolkit/images/',
        src: '**',
        dest: 'public/images/',
        expand: true
      },

      template_images: {
        cwd: 'node_modules/govuk_template_mustache/assets/images/',
        src: '**',
        dest: 'public/images/',
        expand: true
      },

      asset_images: {
        cwd: 'app/assets/images/',
        src: '**',
        dest: 'public/images/',
        expand: true
      }

    },

    // workaround for libsass
    replace: {
      fixSass: {
        src: ['govuk_modules/govuk_template/**/*.scss', 'govuk_modules/govuk_frontend_toolkit/**/*.scss'],
        overwrite: true,
        replacements: [{
          from: /filter:chroma(.*);/g,
          to: 'filter:unquote("chroma$1");'
        }]
      }
    },

    // Watches styles and specs for changes
    watch: {
      css: {
        files: ['app/assets/sass/**/*.scss'],
        tasks: ['sass'],
        options: { nospawn: true }
      }
    },

    // nodemon watches for changes and restarts app
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          ext: 'html, js',
          ignore: ['node_modules/**'],
          args: grunt.option.flags()
        }
      }
    },

    concurrent: {
        target: {
            tasks: ['watch', 'nodemon'],
            options: {
                logConcurrentOutput: true
            }
        }
    }
  });

  [
    'grunt-contrib-copy',
    'grunt-contrib-watch',
    'grunt-contrib-clean',
    'grunt-sass',
    'grunt-nodemon',
    'grunt-text-replace',
    'grunt-concurrent'
  ].forEach(function (task) {
    grunt.loadNpmTasks(task);
  });

  grunt.registerTask(
    'convert_template',
    'Converts the govuk_template to use mustache inheritance',
    function () {
      var script = require(__dirname + '/lib/template-conversion.js');

      script.convert();
      grunt.log.writeln('govuk_template converted');
    }
  );

  grunt.registerTask('default', [
    'clean',
    'copy',
    'convert_template',
    'replace',
    'sass',
    'concurrent:target'
  ]);
};
