---
layout: post
title:  "Angular with Foundation and Gulp"
date: Thu September 11, 2014 3:44 PM
categories: journal
---

Foundation has cool looks, very clean code.  Pain in the ass to learn, little comment in the code, tuts cost $$.  Love
the looks anyway, so I want to use it and will just have to figure it out - the grid system anyway is very similar to
bootstrap, but with the `x-sm` category.

#### [Angular-Foundation](https://github.com/pineconellc/angular-foundation) ([demos](http://pineconellc.github.io/angular-foundation/))
Port of parts of [Angular-UI Bootstrap](http://angular-ui.github.io/bootstrap/) angular directives to Foundation.  They require dependencies *only* on their own JS and Foundation CSS - none of Foundation's JS.  No external libraries or CSS.  So, they did not port many of the components that require external CSS - e.g. [Carousel](https://github.com/angular-ui/bootstrap/tree/master/src/carousel).  I ported this component and it was *very* straightforward.  I'll describe the process in a later article. 

#### [Gulp](http://gulpjs.com/)
Hands down better, easier and cleaner than Grunt, which by comparison is a behemoth pain in the rump.  Lots of modules are available, and many others just work out of the box, by virtue of being able to process node streams! - no *plugin* nonsense.  Right off the bat, I found modules for `Sass`, `uglify`, `minify`, `prefixer`, `watch`, `serve`, `livereload`, etc.  It's awesome, and time to switch!

#### [Yeoman Angular Gulp Generator](https://www.npmjs.org/package/generator-gulp-angular)
Generates a very nice scaffold of a project with Angular 1.2.x/1.3.x, jQuery/Zepto/none(just Angular's jQlite), Bootstrap/Foundation/none (straight CSS), ngRoute/UIRouter, ngResource/Restangular and Less/Sass-Ruby/Sass-Node.  Also generates a very minimal unit and E2E testbench using Karma/Karma-Jasmin and Protractor.

One pretty annoying aspect of this generator is that it places `bower_components` in the `app` directory.  This is easily enough overridden in the `.bowerrc` file in the root of the directory - but it's something that needs to be done for *every* project.

See also [Yeoman Webapp Generator](https://github.com/yeoman/generator-gulp-webapp)

### Generating the App
 * Make sure you have the usual suspects installed *globally*, i.e. with the `-g` flag - `node`/`npm`, `yeoman`, `bower` and `gulp`
 * Install the generator - `npm install -g generator-gulp-angular`
 * Create a working directory, go in it, and then `yo gulp-angular [app-name]`  *(takes about 5 minutes!)*
 
> At this point, the generator will generate the `bower_component` in the `app/` directory.  We can move it, but it's a bit of a pain because then you have to move the root of the server.  This affects all static assets being served, and I spent a bit of time on it and decided it's not worth the effort at the moment.

 * `gulp serve` will bring up the Yeoman generated app backed by Foundation Angular Directives and Foundation CSS
 
#### Customizing Styles and Foundation's Sass
 Sass keeps its Sass configuration (equivalent of Bootstrap's `_variables.scss`) in `foundation/scss/foundation/_settings.scss`. They use the same `!default` mechanism, so to override anything, you just needs to copy `_settings.scss` to you local styles directory and `@import 'settings'` before the `@import ../bower_components/foundation/scss/foundation` in `vendor.scss`.

Create a `/styles/includes` sub-directory and a `_includes.scss` file.  Place all Sass partials in `/styles/includes` and place all `@import` statements in `_include.scss`, and then `@import 'includes'` in `main.scss`.

#### Adding Fonts
The `gulp-angular` generator does not create a `/fonts` directory, so we need to create it manually. Create a `/app/fonts` directory, and copy the `font-awesome` folder in it.  Then, add their stylesheet in `main.scss`:

  * `@import 'fonts/font-awesome/scss/font-awesome.scss';`

Create a `/fonts/project` sub-directory, and place all project fonts in their own sub-directory, including any `bootstrap glyphicon` fonts you may want to use with Angular-Foundation ported Bootstrap components!

#### Installing Angular-Foundation
 * Next, install angular foundation with `bower install --save angular-foundation`

There is a line in `/gulp/wiredep.js` that excludes `foundation`.  This is ostensibly to exclude Foundation's JS files which clearly will not work with Angular, but this seems to also exclude `bower_component/angular-foundation`.  

To get around the problem, just change that line to `exclude:['foundation.js']`.

#### Additions to Gulp
The default gulp task injects all bower components into `index.html`, but not the project scripts.  To enable this, add a new task to `gulp/build.js':

{% highlight javascript linenos %}    
  gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.size());
  });
{% endhighlight %}

and include it as a required task for the `html` task in `gulp/build.js`, the `watch` task in `gulp/watch.js` and the `server` task in `gulp/server.js` :
{% highlight javascript linenos %}  
// build.js - add the 'jsfiles' task to task required efore 'html' task
gulp.task('html', ['jsfiles', 'styles', 'scripts', 'partials'], function () {
 // ...
});

// watch.js - perform the task beforehand, and again on changes
gulp.task('watch', ['wiredep', 'styles', 'jsfiles'] ,function () {
 // ...
   gulp.watch('app/scripts/**/*.js', ['jsfiles', 'scripts']);
 // ...
});

// server.js
gulp.task('serve', ['jsfiles', 'watch'], function () {
 // ..
 });
{% endhighlight %}

#### Clean up
Replace yeoman's `favicon.ico`, remove logo images from `/images`, delete the extra styling in `main.scss`, remove the boilerplate code from `/app/scripts/main/main-ctrl.js`, and `/app/partials/main.html`.  Put down an `Angular-foundation` markup in `/app/partials/main.html`, and the associated JS in `/app/scrips/main/main.js` and start hacking!

#### Initialize Git
Don't forget to `git init`, `git add .`, `git commit -m initial commit`!  Push to `bitbucket`.

### Issues
1. I don't understand how the `fonts` task in `gulp/build.js` is supposed to work!  It sources `$.mainBowerFiles()`, returning a bunch of `.js` files, and then filters it with `$.filter('**/*.{eot,svg,ttf,woff}')` ... which it seems to me returns an empty set of files.  The upshot is that the `dist` cannot access any of the project's fonts.  So, I commented out the original task and added the following to copy all the fonts from `app/fonts` over to `dist/fonts`.

{% highlight javascript linenos %}    
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
});
{% endhighlight %}




### References
1. [Learning Gulp](http://hmphry.com/gulp) - nice intro, more info than the Tagtree video
2. [Tagtree Intro to Gulp](https://www.tagtree.tv/gulp) - watched it once, project is in `~/Sites/learning-gulp`
3. [Brief Intro to Gulp](https://www.codefellows.org/blog/quick-intro-to-gulp-js) - see the `notify()` and `gulp-util` tasks
4. [Zurb Foundation on Youtube](https://www.google.com/search?q=foundation+css+youtube&oq=foundation+css+youtube&aqs=chrome..69i57j0j69i60.3395j0j9&sourceid=chrome&es_sm=119&ie=UTF-8)
5. [Best Practices for Angular App Structure](https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub)