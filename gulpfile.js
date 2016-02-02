var fs           = require('fs');
var argv         = require('minimist')(process.argv.slice(2));
var concat       = require('gulp-concat');
var gulp         = require('gulp');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');
var jshint       = require('gulp-jshint');
var plumber      = require('gulp-plumber');
var git          = require('gulp-git');
var header       = require('gulp-header');
var footer       = require('gulp-footer');
var merge        = require('merge-stream');
var rename = require('gulp-rename');

config = {};
config.production = argv.production === 1;

var options = {
    uglify: {
        sequences     : true,  // join consecutive statemets with the “comma operator”
        properties    : true,  // optimize property access: a["foo"] → a.foo
        dead_code     : false,  // discard unreachable code
        drop_debugger : false,  // discard “debugger” statements
        unsafe        : false, // some unsafe optimizations (see below)
        conditionals  : true,  // optimize if-s and conditional expressions
        comparisons   : true,  // optimize comparisons
        evaluate      : true,  // evaluate constant expressions
        booleans      : true,  // optimize boolean expressions
        loops         : true,  // optimize loops
        unused        : false,  // drop unused variables/functions
        mangle: true,
        compress:{
            hoist_funs    : false,  // hoist function declarations
            hoist_vars    : false // hoist variable declarations
        },
        if_return     : true,  // optimize if-s followed by return/continue
        join_vars     : true,  // join var declarations
        cascade       : true,  // try to cascade `right` into `left` in sequences
        side_effects  : false,  // drop side-effect-free statements
        warnings      : true,  // warn about potentially dangerous optimizations/code
        global_defs   : {}     // global definitions
    },
    sass: {},
    css:{}
};

if(config.production){
} else {
    options.uglify.drop_debugger = false;
}

if(config.production)
    console.log(' >>> production mode enabled');

function buildJs(sources){

                var config = {
                    pkg: JSON.parse(fs.readFileSync('./package.json')),
                    banner:
                    '/*!\n' +
                    ' * <%= pkg.name %>\n' +
                    ' * <%= pkg.homepage %>\n' +
                    ' * Version: <%= pkg.version %> - <%= timestamp %>\n' +
                    ' * License: <%= pkg.license %>\n' +
                    ' */\n\n\n'
                };

        return merge(sources)
                .pipe(sourcemaps.init())
                .pipe(concat('app.js'))
                .pipe(header('(function (angular) { \n\'use strict\';\n'))
                .pipe(footer('\n}(window.angular));'))
                .pipe(header(config.banner, {
                    timestamp: (new Date()).toISOString(), pkg: config.pkg
                }))
                //.pipe(uglify({preserveComments: 'some'}))
                .pipe(gulp.dest('dist'))
                .pipe(uglify(options.uglify))
                .pipe(rename({extname: '.min.js'}))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest('dist'));

}

// Builds App Scripts
gulp.task('js:app', function() {
    return buildJs(gulp.src(['src/*.js', 'src/lib/*.js']));
});


// JSHint Task
gulp.task('jshint', function() {
    return gulp.src(['gulpfile.js','./app/**'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

//Remove all built files
gulp.task('clean', require('del').bind(null, 'dist'));

// Git Release management
gulp.task('release:commit', ['release:rebuild'], function() {
    return gulp.src(['./package.json', 'dist/**/*'])
        .pipe(git.add())
        .pipe(git.commit(versionAfterBump));
});

gulp.task('release:tag', ['release:commit'], function() {
    git.tag(versionAfterBump, versionAfterBump);
});

gulp.task('release:commit', ['release:rebuild'], function() {
    return gulp.src(['./package.json', 'dist/**/*'])
        .pipe(git.add())
        .pipe(git.commit(versionAfterBump));
});

gulp.task('release:tag', ['release:commit'], function() {
    git.tag(versionAfterBump, versionAfterBump);
});

// End of the git release management


gulp.task('watch', function() {
    gulp.watch(['src/**'], ['js:app']);
});

gulp.task('build', ['js:app']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});


