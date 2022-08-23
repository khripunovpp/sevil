const gulp = require("gulp");
const { parallel, series } = require("gulp");

const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const sass = require('gulp-sass')(require('sass'));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create(); //https://browsersync.io/docs/gulp#page-top
const pug = require("gulp-pug");
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');

// /*
// TOP LEVEL FUNCTIONS
//     gulp.task = Define tasks
//     gulp.src = Point to files to use
//     gulp.dest = Points to the folder to output
//     gulp.watch = Watch files and folders for changes
// */

// Optimise Images
function imageMin(cb) {
    gulp.src("src/assets/images/*")
        .pipe(imagemin())
        .pipe(gulp.dest("dist/images"));
    cb();
}

// Copy all HTML files to Dist
function copyHTML(cb) {
    gulp.src("src/*.html").pipe(gulp.dest("dist"));
    cb();
}


// Scripts
function js(cb) {
    gulp.src("src/assets/js/*js")
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat("main.js"))
        .pipe(uglify())
        .pipe(gulp.dest("dist/js"));
    cb();
}

// Compile Sass
function css(cb) {
    gulp.src("src/assets/sass/*.scss")
        .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
        .pipe(autoprefixer({
            browserlist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest("dist/css"))
        // Stream changes to all browsers
        .pipe(browserSync.stream());
    cb();
}

// Process templates
function pugBuild(cb) {
    gulp.src("src/pages/*.pug")
        .pipe(
            pug()
        )
        .pipe(gulp.dest("dist"));
    cb();
}

// Watch Files
function watch_files() {
    browserSync.init({
        server: {
            baseDir: "dist/"
        }
    });
    gulp.watch("src/assets/sass/**/*.scss", css);
    gulp.watch("src/assets/js/*.js", js).on("change", browserSync.reload);
    gulp.watch("src/pages/*.pug", pugBuild).on("change", browserSync.reload);
    gulp.watch("src/templates/*.pug", pugBuild).on(
        "change",
        browserSync.reload
    );
}

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(pugBuild, css, js, imageMin, watch_files);

// 'gulp build' will build all assets but not run on a local server.
exports.build = parallel(css, js, imageMin);
