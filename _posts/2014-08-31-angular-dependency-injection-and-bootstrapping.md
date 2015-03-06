---
layout: post
title:  "Angular Dependency Injection and Bootstrapping"
date: Mon August 31, 2014 7:05 PM
categories: journal
---

Dependency injection is a key part of Angular, making it possible to write highly modularized, testable code.  In this
article, we look at how it works and how to use it in development and debugging.

### Angular Dependency Injection

1. When a class depends on another, it can
    1. instantiate the dependency itself
    2. refer to it in global
    3. have it get injected in through its parameters
    * this is what angular does
2. Angular's DI consists of 
    * defining and registering dependencies
    * injecting those dependencies 

So, given
{% highlight javascript linenos %}    
function dependent(dependency, args) {
    // use dependenc1 and 2 here ....
}
{% endhighlight %}
we need to locate, instantiate and inject instances of `dependency` into the parameter list of `dependent`.

Objects that *can be injected* are called services, and they are created by a *service* called [`$provide`](https://github.com/angular/angular.js/wiki/Understanding-Dependency-Injection#the-provider-provide), through a method `$provide.provider`.
The `$provide.provider` associates a service name with a constructor whose `$get` method *instantiates* the `serviceName` service.
{% highlight javascript linenos %}    
$provide.provider('serviceName', function() {
    this.$get = function() {  // service constructor function
        return serviceInstance  // an instance function, obj, or primitive
    }
});
{% endhighlight %}
Now, we can inject a function named `serviceName` anywhere in the code using the injector part of the DI. 

> While the `$provide` service provides the mechanism for instantiating services, the service responsible for carrying out the instantiation is the `$injector` service of the `auto` module.  The actual method that does this is `$injector.instantiate`, but it is called by `$injector.get`, if the service (which is a *singleton*) does not yet exist. So, the `$injector` service gets a service from `$provider`, with `$injector.get('serviceName')`, instantiates it if it does not already exist, through `$injector.instantiate(constructor,[locals])` and then injects it into the function with the dependency on the service, using `$injector.invoke(dependent, self, args)`. 

One can get the application's injector through [`angular.injector(['ng', 'myApp'])`](https://docs.angularjs.org/api/ng/function/angular.injector), which itself is configured through `angular.module`.  Once you have a reference to the injector, you can use it to look up a service, look up a function's DI annotations, etc.


{% highlight javascript linenos %}    
angular.module('clientApp', [])
.service('aService', function() {  // register 'aService' with the DI injector
    this.talk = function() { return 'I am aService' }
});
function depFunc(aService, name) {
  console.log(aService.talk(name));
}
var $injector = angular.injector(['ng', 'clientApp']);  // get the injector
var service = $injector.get('aService');   // instantiate the [singular] service
console.log($injector.annotate(depFunc));  // ['aService', 'anArg']
$injector.invoke(depFunc, null, {name: 'Bob'}); // 'I am aService'
{% endhighlight %}

And, say the dependent function `depFun`'s parameters were not `(aService, name)`, but `(aService, someArg)`, you could no longer rely on *implicit* annotation as we've done before.  You would need to do either *explicit* or *inline* annotation, as follows:

{% highlight javascript linenos %}    
// after declaring depFunc, before the invocation
depFunc.$inject = ['aService', 'name'];  
  // or
$injector.invoke(['aService', 'name', depFunc], null, {name: 'Bob'} );
{% endhighlight %}

> The injector's `invoke` method just iterates over the dependent function's annotation, checks to see if the passed in argument object has a key that matches the parameter and assigns it to the argument, otherwise, looks for an available service with that name.

 
{% highlight javascript linenos %}    
function invoke(fn, self, locals){
  var args = [],
      $inject = annotate(fn),
      length, i,
      key;

  for(i = 0, length = $inject.length; i < length; i++) {
    key = $inject[i];
    if (typeof key !== 'string') {
      throw $injectorMinErr('itkn',
        'Incorrect injection token! Expected service name as string, got {0}', key);
      }
      args.push(
        locals && locals.hasOwnProperty(key)
         ? locals[key]
         : getService(key)
      );
    }
    if (!fn.$inject) {
      // this means that we must be an array, i.e. 
      // $injector.invoke( ['aService', 'name', depFunc], null, {name:'Bob'});
      // "The array notation", https://docs.angularjs.org/api/auto/service/$injector
      fn = fn[length];
    }

  // http://jsperf.com/angularjs-invoke-apply-vs-switch
  // #5388
  return fn.apply(self, args);
}
{% endhighlight %}

### Angular Bootstrap
The following is a description of the step by step process of starting up an angular app, as described in [3], below.  It is here for reference. The logic is pretty simple:

1. Create a module
2. on `window.load`:
    1. wrap the document in a jQlite, with `$rootElement = angular.element(window.document)`
    2. create an injector for 'ng' module with `$injector = angular.injector(['ng])`
    3. use the injector to get the `$compile` service with `$compile = $injector.get('$compile)`
    4. compile the document and get link function with `compositeLinkFn = $compile($rootElement)`
    5. use the injector to get the `$rootScope`, with `$rootScope=$injector.$get('$rootScope')`
    6. link the compiled template to the scope with `compositeLinkFn($rootScope)`
    7. start the digest cycle with `$rootscope.apply()`

{% highlight javascript linenos %}    
// Create a module
angular.module('myApp', []);

window.onload = function() {

  var $rootElement = angular.element(window.document); // wrap document in jqlite

  var modules = [
    'ng',      // hidden module that has all the directives in angular - REQURIED
    'myApp',   // only needed if 'myApp' module has services to be injected
    function($provide) {  // for reference, not needed since we already
                          // have $rootElement from above!
      $provide.value('$rootElement', $rootElement)
    }];

  var $injector = angular.injector(modules); // only one injector per application!!

  var $compile = $injector.get('$compile');  // THIS IS THE MAGIC
                                             // traverse DOM from root element, 
                                             // discovering directives
                                             
  var compositeLinkFn = $compile($rootElement);  // this returned  function will then
                                                 // link to the scope.

  var $rootScope = $injector.get('$rootScope');
  compositeLinkFn( $rootScope );          // remove the bound elements from the DOM,
                                          // replace by a comment, to be replaced
                                          // again by the linker - at $digest cycle
  $rootScope.firstname = 'Bob';
  $rootScope.lastname = 'Jones';
  $rootScope.$apply();  // Start the $digest cycle!!
}
{% endhighlight %}

### Debugging Angular

#### Retrieving an Injector

In the code above, we created a new injector.  We did *not* retrieve the existing *singleton* injector of an existing app.  You can do this with the following:

{% highlight javascript linenos %}    
// Get the DOM element where the app is bound
var element = document.querySelector('.ng-scope');
var injector = angular.element(element).injector();

// now you can get specifics of the application
var $rootElement = injector.get('$rootElement');
var $location = injector.get('$location');
var $anchorScroll = injector.get('$anchorScroll');
{% endhighlight %}    

For example, to scroll the app to a particular scroll location:

{% highlight javascript linenos %}    
// Get the app's injector
var $injector = angular.element( document.querySelector('[ng-app]') ).injector(); 
// get the $location and $anchorScroll services from the injector
var $location = $injector.get('$location');
var $anchorScroll = $injector.get('$anchorScroll');
// set the location hashtag
$location.hash('someId'); // some dom element with id="someId" 
// scroll over
$anchorScroll();
{% endhighlight %}    

#### Retrieving a scope
To retrieve the scope at a DOM node element, simply select the node, wrap it in jqLite using `angular.element()` and then call its `scope` method:

{% highlight javascript linenos %}    
// select a DOM element by some means ...
var element = document.getElementById('#someElem');
// wrap in jqLite and call scope() method
var elemScope = angular.element(element).scope();
// access scope variables
elemScope.someMethod(); 
{% endhighlight %}    

#### Retrieving a Directive's Controller
Retrieving a controller is done through the `controller` method:

{% highlight javascript linenos %}    
// select a DOM element by some means ...
var element = document.getElementById('#someElem');
// wrap in jqLite and call scope() method
var elemScope = angular.element(element).controller();
{% endhighlight %}    

#### References
[1] [Understanding DI](https://github.com/angular/angular.js/wiki/Understanding-Dependency-Injection)<br>
[2] [$injector API](https://docs.angularjs.org/api/auto/service/$injector) <br>
[3] [Writing Angular Directives](https://www.youtube.com/watch?v=WqmeI5fZcho&list=TLy7SSW1DVZDwghegLeKG2NJqWtcxPZeNK)