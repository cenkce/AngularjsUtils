// Karma configuration
// Generated on Mon Jan 11 2016 11:52:39 GMT+0200 (EET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],
    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-requirejs',
      'karma-jasmine'
    ],

    // list of files / patterns to load in the browser
    files: [
        './node_modules/angular/angular.js',
        './node_modules/angular-mocks/angular-mocks.js',
        'examples/bower_components/cropperjs/dist/cropper.css',
        'examples/bower_components/cropperjs/dist/cropper.js',
        'examples/bower_components/exif-js/exif.js',
        'dist/app.js',
        {pattern: 'test/mock/images/*.jpg', watched: false, included: false, served: true, nocache:false},
        'test/*.js'
    ],

/*
    proxies: {
      "/img/": "/base/test/mock/images"
    },
*/

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 8082,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    loggers:[{type: 'console'}],
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
};
