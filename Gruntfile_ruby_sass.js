module.exports = function(grunt){
  grunt.initConfig({

    // Builds Sass
    sass: {
      dev: {
        files: {
          'public/stylesheets/application.css': 'app/assets/sass/application.scss',
          'public/stylesheets/examples.css': 'app/assets/sass/examples.scss',
          'public/stylesheets/elements.css': 'app/assets/sass/elements.scss'
        },
        options: {
          loadPath: [
            'govuk_modules/govuk_template/assets/stylesheets',
            'govuk_modules/govuk_frontend_toolkit/stylesheets'
          ],
          style: 'expanded'
        } 
      }
    },

    // Copies templates and assets from external modules and dirs
    copy: {

      govuk_template: {
        cwd: 'node_modules/govuk_template_mustache/',
        src: '**',
        dest: 'govuk_modules/govuk_template/',
        expand: true
      },

      govuk_frontend_toolkit: {
        cwd: 'node_modules/govuk_frontend_toolkit/',
        src: '**',
        dest: 'govuk_modules/govuk_frontend_toolkit/',
        expand: true
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
          ignore: ['node_modules/**']
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
    'grunt-contrib-sass',
    'grunt-nodemon',
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
    'copy:govuk_template',
    'copy:govuk_frontend_toolkit',
    'convert_template',
    'copy:govuk_frontend_toolkit',
    'sass',
    'concurrent:target'
  ]);
};
