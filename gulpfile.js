const { src, dest, watch, series } = require('gulp'),
	plumber     = require('gulp-plumber'),
	browserSync = require('browser-sync'),
	stylus      = require('gulp-stylus'),
	uglify      = require('gulp-uglify'),
	concat      = require('gulp-concat'),
	jeet        = require('jeet'),
	rupture     = require('rupture'),
	koutoSwiss  = require('kouto-swiss'),
	prefixer    = require('autoprefixer-stylus'),
	imagemin    = require('gulp-imagemin'),
	cp          = require('child_process');

var messages = {
	jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
function doJekyllBuild(done) {
	browserSync.notify(messages.jekyllBuild);
	cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
		.on('close', done);
	done();
}

/**
 * Rebuild Jekyll & do page reload
 */
function doJjekyllRebuild(done) {
	jekyllBuild(done);
	browserSync.reload();
	done();
}

/**
 * Wait for jekyll-build, then launch the Server
 */
function doBrowserSync(done) {
	doJekyllBuild(done);
	browserSync({
		server: {
			baseDir: '../bebo-dot-dev.github.io'
		}
	});
	done();
}

/**
 * Stylus task
 */
function doStylus(done) {
	src('src/styl/main.styl')
		.pipe(plumber())
		.pipe(stylus({
			use:[koutoSwiss(), prefixer(), jeet(),rupture()],
			compress: true
		}))
		.pipe(dest('../bebo-dot-dev.github.io/assets/css/'))
		.pipe(browserSync.reload({stream:true}));
	done();	
}

/**
 * Javascript Task
 */
function doJs(done) {
	src('src/js/**/*.js')
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(dest('../bebo-dot-dev.github.io/assets/js/'));
	done();
}

/**
 * Imagemin Task
 */
function doImageMin(done) {
	src('src/img/**/*.{jpg,png,gif}')
		.pipe(plumber())
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(dest('../bebo-dot-dev.github.io/assets/img/'));
	done();
}

/**
 * Watch stylus files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
function doWatch(done) {
	watch('src/styl/**/*.styl', doStylus);
	watch('src/js/**/*.js', doJs);
	watch('src/img/**/*.{jpg,png,gif}', doImageMin);
	watch(['*.html', '_includes/*.html', '_layouts/*.html', '_posts/*'], doJjekyllRebuild);
}

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
 exports.default = function(done) {
	series(doStylus, doJs, doImageMin, doBrowserSync, doWatch);
	done();
 } 
 exports.doStylus = doStylus;
 exports.build = series(doStylus, doJs, doImageMin, doBrowserSync, doWatch);
