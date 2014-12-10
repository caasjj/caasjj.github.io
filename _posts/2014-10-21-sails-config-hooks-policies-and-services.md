---
title: Sails Config, Hooks, Policies and Services
date: Tue Oct 21, 2014 11:59 AM
tag: sails, sailsjs, javascript
---

Once you get past the basics of SailsJS, you find an opinionated but very flexible (and well designed!) environment to implement feature rich apps.  In this article, we cover some of the slightly more advanced architectural topics in Sails, consisting of app configuration, hooks, policies and services.

It's always worth remembering that Sails is first and foremost an `Express` app, and therefore *middleware* plays a central role in how Sails operates. 

## Configuration

You can determine the configuration of a sails app at runtime using the `sails.config` object.  This object will contain a merge of all the configuration parameters on command line, environment, `.sailsrc`, and modules in `/config` directory.

The order of priority is:

1. Object passed to app.lift()
2. Local `.sailsrc` file
3. Global `.sailsrc` file
4. Command line (e.g. `sails lift --port=xxxx`)
5. Environment variables (e.g. `SAILS_PORT=1339`, always like `SAILS_xxxx`)
6. Files in `/config`

#### Using app.lift( configObj )

{% highlight javascript linenos %}    
var Sails = require('sails').constructor;
// Load logic from `routes` directory
var routes = require('./routes');
var user = require('./routes/user');
var app = new Sails();
app.lift({
  // run on port 1337
  port: 1337,
  // turn off grunt hook
  hooks: { grunt: false },
  // turn off the global objects
  globals: false,
  // even configure routes
  routes: {
    'get /': routes.index,
    'get /users': user.list
  }
});
{% endhighlight %}    

#### Using .sailsrc

Sails looks for a `.sailsrc` file much like `npm` looks for modules in `node_modules` hierarchy: the current directory, then the parent, etc.

You can force any of the existing configuration parameters or even define any new parameter in a `.sailsrc` file in the current directory or parent directory.  You can also define a global `~/.sailsrc` file, but any values replicated in the lcoal `.sailsrc` file will be overridden by the local values.

You should place rather permanent configuration parameters for a given app in the local directory structure and parameters common to *all* sails app you develop in the global location.

{% highlight javascript linenos %}    
// .sailsrc
{
  // this will appear as sails.config.myconf and
  // then you can access the individual attributes
  myconf: {
      v1: 'Hello',
      v2: 'An awesome app'
  },
  // set sails.config.cors.allRoute to true, regardless
  // of what is in app/config/cors.js
  cors: {
      allRoutes: true
  },
  // and also turn off the grunt hook
  hooks: { 
    grunt: false
  }
}
{% endhighlight %}    

#### Using command line arguments

You can also set configuration parameters right on the command line.  This should be used primarily to change environment (e.g. 'development' vs 'production') or ports.

`sails lift --port=1338 --environment=production`

The above will set the `sails.config.port` and `sails.config.environment` accordingly.

The existing configuration files used by a default Sails app are described in [Anatonmy of a Sails App/config](http://sailsjs.org/#/documentation/anatomy/myApp/config).


#### Using api/config

This is the primary place where you set up the bulk of the configuration of your app.  Every `.js` file in the `/config` directory is expected to have a `module.exports` that export some configuration object.  While it is not mandatory, it is customary to export an object that has the same name as the base of the file in which it is contained.  For example:

{% highlight javascript linenos %}    
// config/someconfig.js
module.export.someconfig = {
    // configuration attributes
}
{% endhighlight %}



## Hooks 

See [Understanding Hooks](https://github.com/balderdashy/sails-docs/blob/master/concepts/extending-sails/Hooks/customhooks.md)

Hooks are basically modules that can be executed at lift, and optionally synchronized to various events fired by other hooks - so that the order of execution can be established.

User developed Hooks must be stored in 'api/hooks' directory, while Sails' own hooks are in `node_modules/sails/lib/hooks`.

A hook is an exported function that takes in the `sails` event emitter object and returns a configuration object.

{% highlight javascript linenos %}
// lib/hooks/myhook.js
module.exports = function(sails){
 // private methods and variables
 var privateFunc = function() { // do something };
 var privateVar = 'hidden';
 
 return {
   someFunction: function() {},
   someAttribute: 'hello',
   
   configure: function() {
      // run hook configuration code
   },
   
   // optional route: attribute to set functionality
   // before and after controller action
   route: {
     before: {
       '/routeA': function(req,res,next) {
         // execute for route /route BEFORE
         // executing the controller action
       }  
     },
     after: {
       '/*': function(req, req, next) {
         // execute for ALL routes AFTER
         // executing the controller action
         // e.g. set some 'res' parameters
       }
     }
   },
   // initialize is not required, but if included
   // it must return cb();
   initialize: function(cb) {
     // do stuff
     this.someFunction();
       ...
     // events to wait for before proceeding
     // first, be sure the hook that triggers
     // the event exists!
     var arrayOfEvents = [
       'hook:pubsub:loaded',
       'hook:sockets:loaded'
     ];
     // execute callback after some events
     sails.after([arrayOfEvents], function() {
       // emit your own done event!
       sails.emit('hook:myhook:done');
       return cb();
     });
   }
 }   
}
{% endhighlight %}


## Policies

Policies are middleware used for authentication and access control.  Therefore, they always have a signature of `module.exports = function(req, res, next) { }`.  Since they are middleware, they can be attached to controller actions *but not to views*.  Routes pointing directly to views will *not* go through any policy.

Policies are stored in `api/policies` as `.js` files, and are configured by the Access Control List (ACL) in `config/policies.js`.  Given a policy `api/policies/somePolicy.js`, you can refer to it as `somePolicy` in the ACL.

A default policy mapping is indicated by `*` as the key for the mapping, and can be set to `true` or `false` for `public` access or `blocked` respectively. `blocked` means exactly that, nothing gets through whatsoever!

{% highlight javascript linenos %}
// config/policies.js
module.export = {

  // by default policy, everything is public
  '*': true, // or false for blocked
 
  // entire controller is publicly accessible
  OtherController: {
   '*': true,
  },
  
  AnotherController: {
   '*': true,
   // except OtherController.action2 which requires
   // myPolicy to be applied - the specified mapping
   // overrides the default '*' mapping
   action2: 'myPolicy'
  },
  
  // controller action
  SomeController: {
    // read is publicly open
    read: true,
    // apply myPolicy custom policy to SomeController.edit
    edit: 'myPolicy',
    // apply myPolicy and myOtherPolicy in that 
    // order to SomeController.action2
    action2: ['myPolicy', 'myOtherPolicy']
  }       

}
{% endhighlight %}    


## Services

A `service` is a *global* object that can be used to implement functionality that is independent of any specific route, controllers or models.  Since they are *global* objects, Services are available anywhere in a Sails app, simply by their global object name, which is simply the filename stripped of the `.js` extension.

A service named `SomeService` must be stored in `api/services/SomeService.js`, and then can be accessed in any Sails app under `SomeService` object.

{% highlight javascript linenos %}    
// SomeService.js
module.export = {
 sendMail: function(options) {
   // send an email using some email library
 }
}

// SomeController.js
module.exports = {
// Note: no require('SomeService') needed
    someAction: function(msg) {
       // ... 
       if (disasterHappend) {
         SomeService.sendMail( {
          recipient: 'admin@companycom',
          message: 'A disaster happened'
         });
       }
    }
}
{% endhighlight %}

