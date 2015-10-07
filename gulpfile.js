'use strict';
let gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  mocha = require('gulp-mocha-co'),
  exit = require('gulp-exit');

gulp.task('nodemon', () => {
  nodemon({
    args: ['80'],
    script: 'index.js'
  });
});

gulp.task('test', () => {
  gulp.src(['tests/*.js'])
    .pipe(mocha({
        reporter: 'progress'
      }))
    .pipe(exit());
});

gulp.task('default', ['nodemon']);
