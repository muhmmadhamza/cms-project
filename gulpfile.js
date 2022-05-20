'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')

const prefixerOptions = {
  overrideBrowserslist: ['last 2 versions']
}

sass.compiler = require('sass')

gulp.task('sass', function() {
  return (
    gulp
      .src('./static/**/*.scss', { base: './' })
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer(prefixerOptions))
      // .pipe(minifyCSS())
      .pipe(gulp.dest('.'))
  )
})
gulp.task('sass:watch', function() {
  gulp.watch('./static/**/*.scss', gulp.series('sass'))
})
