module.exports = function(){
    clean()
    sassExtensions()
    // in parallel:
    copyAssets()
    sass()
    // in parallel:
    watch()
    runNodemon()
}

function clean() {
    // doesn't clean extensions.scss, should it?
    const fs = require('fs')
    fs.rmSync('public', { recursive: true, force: true })
    fs.rmSync('.port.tmp', { force: true })
}

function sassExtensions() {
    const fs = require('fs')
    const path = require('path')
    const extensions = require('./lib/extensions/extensions')
    let fileContents = '$govuk-extensions-url-context: "/extension-assets"; '
    fileContents += extensions.getFileSystemPaths('sass')
        .map(filePath => `@import "${filePath.split(path.sep).join('/')}";`)
        .join('\n')
    fs.writeFileSync(path.join('lib/extensions', '_extensions.scss'), fileContents)
}

function sass() {
    // to do: compile all sass files, not just application.scss
    console.log('compiling CSS...')
    const fs = require('fs')
    const sass = require('sass')
    const result = sass.compile("app/assets/sass/application.scss", {
        logger: sass.Logger.silent,
        loadPaths: [__dirname],
        sourceMap: true,
        style: "expanded"
    })
    fs.mkdirSync('public/stylesheets', { recursive: true })
    fs.writeFileSync("public/stylesheets/application.css", result.css)

    // return gulp.src(config.paths.assets + '/sass/*.scss', { sourcemaps: true })
    // .pipe(sass.sync({ outputStyle: 'expanded', logger: sass.compiler.Logger.silent }).on('error', function (error) {
    //   // write a blank application.css to force browser refresh on error
    //   if (!fs.existsSync(stylesheetDirectory)) {
    //     fs.mkdirSync(stylesheetDirectory)
    //   }
    //   fs.writeFileSync(path.join(stylesheetDirectory, 'application.css'), '')
    //   console.error('\n', error.messageFormatted, '\n')
    //   this.emit('end')
    // }))
    // .pipe(gulp.dest(stylesheetDirectory, { sourcemaps: true }))
}

function copyAssets() {
    console.log('copying assets...')
    const fs = require('fs-extra')
    const filterFunc = (src, dest) => {
        return !src.startsWith("app/assets/sass")
    }
    
    fs.copy('app/assets', 'public', { filter: filterFunc }, err => {
        if (err && err.code != 'EEXIST') return console.error(err)
    })
}

function watch() {
    const chokidar = require('chokidar')

    chokidar.watch('app/assets/sass', {
        ignoreInitial: true
    }).on('all', (event, path) => {
        console.log('watch sass')
        console.log(event, path)
        sass()
    })

    chokidar.watch([
        'app/assets/**',
        '!app/assets/sass/**'
    ],{
        ignoreInitial: true
    }).on('all', (event, path) => {
        console.log('watch assets')
        console.log(event, path)
        copyAssets()
    })
}

function runNodemon() {

    const fs = require('fs')
    const path = require('path')

    const nodemon = require('nodemon')

    // Warn about npm install on crash
    const onCrash = () => {
        log(colour.cyan('[nodemon] For missing modules try running `npm install`'))
    }

    // Remove .port.tmp if it exists
    const onQuit = () => {
        try {
        fs.unlinkSync(path.join(__dirname, '/../.port.tmp'))
        } catch (e) {}
    
        process.exit(0)
    }
  
    nodemon({
      watch: ['.env', '**/*.js', '**/*.json'],
      script: 'listen-on-port.js',
      ignore: [
        'public/*',
        'app/assets/*',
        'node_modules/*'
      ]
    })
    .on('crash', onCrash)
    .on('quit', onQuit)
}