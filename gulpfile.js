//
//  gulpfile.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var sequence = require('run-sequence');
var rimraf = require('gulp-rimraf');
var gutil = require('gulp-util');
var proc = require('child_process');

var pid = null;

gulp.task('default', function(done) {
    sequence('build', ['start'], 'watch', done);
});

gulp.task('build', function(done) {
    sequence(['clean','server'], done);
});

gulp.task('clean', function() {
    return gulp.src('dist', { read: false })
        .pipe(rimraf({ force: true }));
});

gulp.task('server', ['clean'], function() {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015', 'stage-0']
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('start', function(done) {
    // Just kill any existing servers
    if (pid) {
        console.log(gutil.colors.cyan('GULP > Killing old server...'));
        pid.kill();
    }

    // Start server
    pid = proc.spawn('node', ['dist/index.js'], { stdio: 'inherit' });

    // Listen for errors
    pid.on('close', function(code) {
        console.log(gutil.colors.red('GULP > Server stopped'));
        console.log(gutil.colors.cyan('GULP > Waiting for changes...'));
    });
    pid.on('error', function() {
        console.log(gutil.colors.cyan('GULP > Server error'));
        console.log(gutil.colors.cyan('GULP > Waiting for changes...'));
    });

    console.log(gutil.colors.green('GULP > Server is coming up...'));
    done();
});

gulp.task('watch', function(done) {
    gulp.watch('src/**/*', ['default']);
    done();
});
