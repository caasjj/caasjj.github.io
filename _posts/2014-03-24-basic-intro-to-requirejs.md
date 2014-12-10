---
title: Basic Intro to RequireJS
date: Mon March 24, 2014 11:23PM
tag: javascript
---

RequireJS is used to asynchronously load scripts and their dependencies, without you having to worry about synchronizing loading of scripts.  Another, possibly more useful, usage is modularizing client side code.  Using RequireJS, you can design your code in CommonJS compliant modules and have RequireJS load them asynchronously.  We'll show the basics of how to do this here.

<h3>Loading RequireJS</h3>
The first step to using RequireJS is to load the script somewhere in your root HTML file as follows:

{% highlight html linenos %}    
<script src="lib/require.js" data-main="app"></script>
{% endhighlight %}    

<code>data-main</code> is a special attribute that is used by RequireJS to define an entry point, which one will typically use to initialize configuration / initialization options before loading application modules.

In the above example, RequireJS will be loaded and will then look for a <code>app.js</code> file to execute. It will also implicitly establish the root URL to the current directory, ie. the directory of the file containing the above tag.  Hence, all subsequent relative paths will refer to this path as the base, with the following exceptions:

{% highlight html linenos %}    
<ul>	
	<li>The file to load has a <code>".js"</code> extension</li>
	<li>or starts with <code>"/"</code>
	<li>or starts with a URL protocol, ie. <code>http</code> or <code>https</code></li>
</ul>
{% endhighlight %}    

If you want to explicitly set the base url, you can use <code>baseUrl</code> in RequireJS configuration.

Now, let's look at the two main methods defined in RequireJS: <code>require()</code>, which is used to load modules, and <code>define()</code>, which is used to create modules with an exportable interface.
<h4>Requiring Modules</h4>
The general format of the <code>require</code> invocation is :

{% highlight javascript linenos %}    
require(['dependency1', 'dependency2', ..], function(d1, d2, ...) {} )
{% endhighlight %}

The above will load the named modules listed in the array, and execute the anonymous function passing it the values returned by the loaded modules.  The modules can be defined in various ways.  They can be defined via a URL or a local file, as shown below.

<h4>Defining Modules</h4>
Modules are defined in individual files, one module per file.  Placement of multiple modules in a single file should only be done using the RequireJS Optimization tool (as part of a build / minification process).

The general format of the <code>define</code> invocation is:

{% highlight javascript linenos %}    
define('moduleName',
   ['dependency1', 'dependency2', ..],
   function(d1, d2, ...) {
     return module;
   } );
{% endhighlight %}    

The best way to explain how to use <code>RequireJS</code> is probably through an example, which will be the subject of the next section.
<h2>Example</h2>
We will use RequireJS, Handlebars and jQuery to write the world's most convoluted <code>Hello World</code> example.  But, the objective is to use several features of <code>RequireJS</code> to demonstrate its use.

We will create an app that will use the following external libraries: <em>jQuery</em>, <em>Handlebars</em> template engine, as well <em>underscore</em>.  We will also use <code>text.js</code>, a <code>RequireJS</code> plugin used to handle text file dependencies, such as a template file used to store HTML strings. In order to demonstrate different methods of loading modules, we will place some of these source files in the directory structures and load others from a CDN.

In addition to the external modules, we will <code>define</code> and <code>require</code> an internal module to demonstrate the main usage of <code>requireJS</code>, which is modular development.
<h4>Directory Structure</h4>
The directory structure for the application will be very simple, as follows:
<PRE>
    /
    app.js
    index.html
    /lib
       underscore.js
       text.js
       require.js
       jquery.js
       /modules
           myModule.js
       /templates
           template.html
</PRE>
<h4>index.html</h4>
In our main file, <code>index.html</code>, we will include the <code>require.js</code> file, and define the entry point to the application as <code>app.js</code> with the <code>data-main</code> attribute.  Note that for the <code>baseUrl + path</code> module loading, we do not include <code>.js</code> at the end of the file name.  The location of the <code>require.js</code> file is relative to the location of <code>index.html</code>.

{% highlight html linenos %}    
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="lib/require.js" data-
    main="app">
    </script>
    <title>Document</title>
</head>
<body>
</body>
</html>
{% endhighlight %}    

<h4>app.js</h4>

<code>app.js</code> is used to configure <code>RequireJS</code> and load the main module <code>myModule</code>.

{% highlight javascript linenos %}    
require.config({
    baseUrl: "lib",
    paths: {
        text :"text",
        x1: "jquery",
        x2:	"http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.1.2/handlebars.min"
        },
    shim: {
        'app' : ['x1', 'x2']
    }
});
require(['app']);
require(['modules/myModule'], function(mod) {
    mod.init();
});
{% endhighlight %}    

The base URL, <code>baseUrl</code> is set to the <code>lib</code> directory on line 2.  The paths to the <code>text</code> plugin, <code>jQuery</code> library and <code>Handlebars</code> are set up in the <code>paths { }</code> object passed to the <code>config</code> method.  We intentionally used non-descript names <code>x1, x2</code> for <code>jQuery,Handlebars</code> to show that these are arbitrary parameters.  The <code>shim</code> object is used to load modules like <code>jQuery</code> that do not necessarily conform to CommonJS but instead define a global object.  Both jQuery and Handlebars are loaded this way.  The <code>RequireJS</code> plugin <code>text</code>, however, is loaded as a module, and does not appear in the <code>shim</code> object.  You will see it required in the definition of <code>myModule</code>, with <code>define(['text!..])</code>.  Finally, we load the main module <code>myModule</code>, which loads and executes, returning an object with an <code>init</code> function.  This object is passed to the anonymous function as the <code>mod</code> parameter, which invokes that method through <code>mod.init()</code>
<h4>myModule.js</h4>
This file defines the locally defined module, which as shown in the call to <code>define()</code>, has a dependency on a template file which happens to be a text file loaded with the <code>text</code> plugin.  Once this HTML file is loaded, it is passed to the anonymous function as the <code>divTemplate</code> parameter.  As can be seen below, <code>template.html</code> is simply a Handlebars template.  This template is compiled, and invoked using a <code>{name: 'Bob'}</code> context.  Finally, the rendered HTML is appended to the body using jQuery.

{% highlight javascript linenos %}    
define( ['text!templates/template.html'], function (divTemplate) {
  return {
    init: function() {
              var template = Handlebars.compile(divTemplate),
              html = template({name: 'Bob'});
              jQuery('body').html( html );
          }
    };
});
{% endhighlight %}    

<h4>template.html</h4>
This is a <code>Handlebars</code> template that will be rendered in the context of an object with a <code>name</code> parameter.

{% highlight html linenos %}    
<div id="main">
  <p>Hello there, {{name}}.
  </p>
</div>
{% endhighlight %}    

The output of all of this will simply be 


<blockquote>Hello there, Bob.</blockquote>
