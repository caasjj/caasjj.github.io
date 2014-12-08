---
layout: post
title:  "Creating Grunt Tasks"
date: Mon August 11, 2014 3:36 PM
categories: journal

---

This article reviews in detail how to create, configure, register and launch tasks in grunt.

## Grunt Plugin Creation

#### Initializing with grunt-init
* Always start with a grunt plugin generator template [grunt-init-gruntplugin](https://github.com/gruntjs/grunt-init-gruntplugin)
	* creates boilerplate code for the plugin
	    * with directory structure, `nodeunit` tests, `jshint` and `clean` facilities
	* install grunt-init globally with `npm install -g grunt-init` first if you don't have it already
	* place the template in your `~/.grunt-init/` directory with: <BR> `git clone https://github.com/gruntjs/grunt-init-gruntplugin.git ~/.grunt-init/gruntplugin
`
	* in an empty directory (`myplugin/`), invoke `grunt-init plugin` 
	    * our plugin is 'myplugin', so that should be the empty directory name
	* this will generate a directory `./myplugin/` with the following subdirectories and files (and a few others we'll ignore)
		* `tasks` : directory with `myplugin.js`, the source file for your plugin
		* `test` : directory with `myplugin_test.js`, as well as `expected/` and `fixtures/` subdirectories to support tests
		* `Gruntfile.js` : standard grunt file with `grunt.loadTasks('tasks');` to load your plugin
	* it will also create and register the following tasks by default
		* `jshint`   : run jshint on `Gruntfile` and `./tasks/*.js` as well as all files in `tests` properties of `nodeunit` task
			* `nodeunit.tests` is defined as `['test/*_test.js']`
		* `clean`    : remove files created in `/tmp` directory
		* `nodeunit` : unit tests with nodeunit module

#### Authoring the plugin

* The general for a plugin is to
    * register a task or multi-taskwith, and in the associated callback
        * merge task and target options
        * iterate over all source files, and in the associated callback
          * read the source file
          * create output content
          * write output to destination file   
{% highlight javascript %} 
grunt.task.registerMultitask('myplugin', 'description', function taskFunction(){
  // merge task and target level options
  var options = this.options({ /* additional/overridden options */});
  // iterate over task/target's files
  var output = this.files
    .forEach(function(file) {
      var src = file.src.filter(function(filepath) {
      // return true if error checking passes
     })
     .map(function(filepath) {
       // read file and process as needed  
     });     
  });
  grunt.file.write(file.dest, output);
});
{% endhighlight %}    
   
* read and merge `task` and `target` level options
* this can be executed directly in the `Gruntfile`, or loaded via `grunt.loadTasks('taskPath')`
    		
## Task Configuration

   * see [grunt.config](http://gruntjs.com/api/grunt.config) for details
   * all configuration in `Gruntfile.js` with `grunt.config.init` (aliased with `grunt.initConfig`)
   * creates `grunt.config` object
       * `grunt.config([prop [,value]])` getter/setter (`[,value]` option included in the call)
       * `grunt.get(prop)`, and `grunt.set(prop, value)`
       * **template**: use `<% %>`, to use configuration variables
   * `grunt.config` may be assigned any arbitrary parameter using any valid JS expression
       * e.g. a prop property with: `{ prop: value }`
           * accessible in task through `grunt.options('prop')` or `grunt.options.get('prop')`
       * or with a function: `{ pkg: grunt.file.readJSON('package.json') }`
           * property `prop` in `package.json` accessible through `<% pkg.prop %>`
   * within each task, `this.options()` refers to the task's `options` field, and `this.files()` to `files`
   * tasks are configured by assigning a property to `grunt.config` with the task name <BR>
       * tasks that are 'multi-task' may have multiple targets as shown below
       * targets have `options` and `files` properties
   * for example, our `myplugin` multi-task would be configured with 3 tasks as follows: <BR>
{% highlight javascript %}
grunt.config.init({
  myplugin: {
    options: {
      // task level options (optional)
    },
    target0: {
    // tast: 'myplugin', target: 'target0'
      options: {
        // target level options, overrides task level options
      },
      files: {
        // target src/dest files mapping
      }
	},
    target1: {
    },
    target2: {
    }
}
{% endhighlight %}


#### Mapping Files
* may use regular unix-like file pattern globbing (`*,?,.` etc) 
 
#### Static File Mappings - `expand: !true`
	
{% highlight javascript %}
{
  grunt.config.init({
    myplugin: {
      // COMPACT FORMAT
      target0: {
      	// multiple source files, no destination file(e.g. jshint)
      	src: [ "src/file_in1", "src/file_in2"]
      },
      target1: {
        options: {},
        // multiple source files into single output destination file (e.g. concat)
        src: [ "src/file_in1", "src/file_in2" ] 
        dest: "dest/file_out",
      }, 
     // FILES OBJECT FORMAT
     target2: {
        options: {},
        files: {
        // multiple multiple source files into multiple destination files (e.g. concat, min)
        'dest/file1_out': ["src/file1_in1", "src/file1_in2"], 
        'dest/file2_out': ["src/file2_in1", "src/file2_in2"]
        }
      },
     // FILES ARRAY FORMAT
     target3: {        
        options: {},
        // files array format - multiple sources into multiple destination directories (e.g. copy, build)
        files: {[
          { 
            src: ['src/file1_in1', 'src/file1_in2'],
            dest: 'dest/dir1_out/'
          },
          { 
            src: ['src/file2_in1', 'src/file2_in2'],
            dest: 'dest/dir2_out/'
          }
        ]}
      }
    }
  });
}
{% endhighlight %}

#### Dynamic File Mappings - `expand: true`
* use where you want to process lots of input files, directories and sub-directories 
{% highlight javascript %}
  grunt.initConfig({
    myplugin: {
     target: {
       expand: true,
       cwd: '/path', // set paths relative to this path, which is itself relative to where Gruntfile is
       src: ['Globbing Pattern'], // e.g. ['**/*.js']
       dest: 'dest/',
       ext: '.min.js', // extension of output file
       extDot: 'first' // indicates which dot start the extension
     }
   }
 })
{% endhighlight %} 	

#### Additional Features
