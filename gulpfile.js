'use strict';
var gulp = require('gulp');
var minimist = require('minimist');
var requireDir = require('require-dir');
var chalk = require('chalk');
var fs = require('fs');

// config
gulp.paths = {
  //dist: 'www',
  mobileIndexFile: 'mobileapp_index.html',
  webappIndexFile: 'webapp_index.html',
  jsFiles: ['app/**/*.js', '!app/bower_components/**/*.js'],
  jsonFiles: ['app/**/*.json', '!app/bower_components/**/*.json'],
  templates: ['app/*/templates/**/*'],
  karma: ['test/karma/**/*.js'],
  protractor: ['test/protractor/**/*.js']
};

// OPTIONS
var options = gulp.options = minimist(process.argv.slice(2));

// exclude this bower packages from wiredep for web app
options.bowerExcludesForWeb = ['ionic/', 'ngCordova/' ];
options.modules = {
  webapp_module: 'web',
  mobileapp_module: 'main'
}

// gulp task is called with --webapp key?
if(options.webapp) {
  // building web app
  gulp.paths.dist = 'webapp_dist';
  // exclude main mobile-app module containing all routing etc
  gulp.paths.jsFiles.push('!app/' + options.modules.mobileapp_module + '/**/*.js')
  gulp.paths.templates.push('!app/' + options.modules.mobileapp_module + '/templates/*')
} else {
  // building cordiva\ionic app
  gulp.paths.dist = 'www'
  // exclude main web-app module containing all routing etc
  gulp.paths.jsFiles.push('!app/' + options.modules.webapp_module + '/**/*.js')
  gulp.paths.templates.push('!app/' + options.modules.webapp_module + '/templates/*')
}

// set defaults
var task = options._[0]; // only for first task
var gulpSettings;
if (fs.existsSync('./gulp/.gulp_settings.json')) {
  gulpSettings = require('./gulp/.gulp_settings.json');
  var defaults = gulpSettings.defaults;
  if (defaults) {
    // defaults present for said task?
    if (task && task.length && defaults[task]) {
      var taskDefaults = defaults[task];
      // copy defaults to options object
      for (var key in taskDefaults) {
        // only if they haven't been explicitly set
        if (options[key] === undefined) {
          options[key] = taskDefaults[key];
        }
      }
    }
  }
}

// environment
options.env = options.env || 'dev';
// print options
if (defaults && defaults[task]) {
  console.log(chalk.green('defaults for task \'' + task + '\': '), defaults[task]);
}
// cordova command one of cordova's build commands?
if (options.cordova) {
  var cmds = ['build', 'run', 'emulate', 'prepare', 'serve'];
  for (var i = 0, cmd; ((cmd = cmds[i])); i++) {
    if (options.cordova.indexOf(cmd) >= 0) {
      options.cordovaBuild = true;
      break;
    }
  }
}

// load tasks
requireDir('./gulp');

// default task
gulp.task('default', function () {
  // cordova build command & gulp build
  if (options.cordovaBuild && options.build !== false) {
    return gulp.start('cordova-with-build');
  }
  // cordova build command & no gulp build
  else if (options.cordovaBuild && options.build === false) {
    return gulp.start('cordova-only-resources');
  }
  // cordova non-build command
  else if (options.cordova) {
    return gulp.start('cordova');
  }
  // just watch when cordova option not present
  else {
    return gulp.start('watch');
  }
});
