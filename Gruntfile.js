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
          ],
          outputStyle: 'expanded'
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
      assets: {
        files: [{
          expand: true,
          cwd: 'app/assets/',
          src: ['**/*', '!sass/**'],
          dest: 'public/'
        }]
      },
      govuk: {
        files: [{
          expand: true,
          cwd: 'node_modules/govuk_frontend_toolkit',
          src: '**',
          dest: 'govuk_modules/govuk_frontend_toolkit/'
        },
        {
          expand: true,
          cwd: 'node_modules/govuk_template_mustache/',
          src: '**',
          dest: 'govuk_modules/govuk_template/'
        }]
      },
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

    // Watches assets and sass for changes
    watch: {
      css: {
        files: ['app/assets/sass/**/*.scss'],
        tasks: ['sass'],
        options: {
          spawn: false,
        }
      },
      assets:{
        files: ['app/assets/**/*', '!app/assets/sass/**'],
        tasks: ['copy:assets'],
        options: {
          spawn: false,
        }
      }
    },

    // nodemon watches for changes and restarts app
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          ext: 'js',
          ignore: ['node_modules/**', 'app/assets/**', 'public/**'],
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

  grunt.registerTask('generate-assets', [
    'clean',
    'copy',
    'convert_template',
    'replace',
    'sass'
  ]);

  grunt.registerTask('default', [
    'generate-assets',
    'concurrent:target'
  ]);

  grunt.event.on('watch', function(action, filepath, target) {

    // just copy the asset that was changed, not all of them

    if (target == "assets"){
      grunt.config('copy.assets.files.0.src', filepath.replace("app/assets/",""));
    }

  });

};
