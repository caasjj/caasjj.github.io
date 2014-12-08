---
layout: post
title:  "Angular Providers"
date: Fri September 12, 7:59 AM
categories: journal
---


In angular, services are singleton objects created by factories, which are in turn created by *providers*.  Providers
are constructor functions whose `$get()` method is a service factory function, either returning an instance of the
service or acting as the constructor (i.e. being invoked with `new`).  That is, a provider's `$get` method either gets
invoked as `$get()` to get the instance of the service or `new $get()`, complete with Javascript's prototypal
inheritance behavior.

The `$provide` service lets you register a provider through its `$provide.provider` method.  In this article, we review
how to configure new services and how to modify existing ones at config time.

> A *service* is simply anything that can be *injected* using Angular's DI mechanism. In fact, a service factory simply registers the service with the `$injector` serivce. 

#### Creating Providers

The general form for creating a provider is

{% highlight javascript linenos %}
angular.module('someModule', [])
 // create the provider for the service
  .config(function($provide) {
      $provide.provider('serviceName', function() {
          // initialization, etc.
          this.someConfig = function() {
            // perform configuration of the service
            };
          this.$get = function() {   // inject 'serviceName'
              // service initialization
          };
          //  or
          return {
            $get: function() { 
                // This function returns the actual
                // service ... can have properties, methods,
                // anything.
                return {
                    serviceMethod1: function() {},
                    serviceMethod2: function() {}
                }
              }
            }
      })
  })
  // note the appended 'Provider' to the
  // 'serviceName' .. you cannot inject
  // service instances here, only the
  // service provider ... to guarantee
  // singleton  
  .config(function(getDataProvider)){                                     
  // set up serviceName's configuration parameters
  // through ajax calls, storage, whatever
    getDataProvider.someConfig();
  })
  .run(function(serviceName){
      // ... use the service
      serviceName.serviceMethod1(); 
      // ...
   })
   .controller('SomeController', function(serviceName) {
      //... use the service
      serviceName.serviceMethod2();
   });
{% endhighlight %}

We can in fact use the provider we created in another provider we are about to create!
{% highlight javascript linenos %}    
  .config(function($provide, getDataProvider) {
    $provide.provider('newData', function() {
       // the usual config stuff ...
       this.$get = function(getData) {
           // use 'getData' service ...
           this.data = getData.method1();
           }
     })
  })
{% endhighlight %}    


#### Kinds of Services
Services are used to abstract out common functionality from controllers, to keep those as thin as possible. So, what kind of common behavior or data might we share among services?  Broadly speaking, we have either fixed behavior or dynamic behavior, and also whether that behavior is fixed before app configuration or not until we get to configuration.  Any of this behavior can be defined through the general scheme shown above, but in cases things can be simplified, Angular helps:

* constant - registers an  object that is known at configuration time and can be injected into providers, as well as services of course
* value - registers an object that may need configuration, so is not available until run time and therefore cannot be injected into providers at config time, only into service instances at run time
* factory - a service factory function, i.e. a provider whose `$get` method is a function that returns the *service instance*
* service - a service constructor function, i.e. a provider whose `$get` method is a constructor that is invoked with `new` to instantiate the *service instance*

There is a method for each of the cases above on the `$provide` service.  

* $provide.constant
* $provide.value
* $provide.factory
* $provide.service
* $provide.provider

We present the sweetened version of these in the next section, but the functionality is of course identical.

#### Syntactic Sugar
Angular provides syntactic sugar methods on the `angular.module` object to create short hand for creating the above services.

##### constant
Recall that these can be injected into providers, i.e. at config time.  Use these for e.g. API keys, etc.
{% highlight javascript linenos %}
 // in lieu of .config(function($provide){...})    
.constant('someConstant', value);
{% endhighlight %}    

##### value
These are not available before the `run` block, and can *only* be injected into service instances not providers.  Use 
these for e.g. database credentials, etc.  However, these *can* be overridden by a `decorator`, like any other service.
{% highlight javascript linenos %}   
.value('someValue', value);
{% endhighlight %}  

##### factory
The `.factory` returns an instance of a service.
{% highlight javascript linenos %}    
.factory('serviceName', function() {
  // the return object is the service instance
    return {
        prop: ...
        method: ...
    }
});
{% endhighlight %}
When Angular instantiates the service, it invokes the anonymous function and uses the returned object as the instance of the service.
You can inject this service in a function and then use it as `serviceName.prop` or `serviceName.method()`.

##### service ([jsfiddle](http://jsfiddle.net/caasjj/kqctk8uy/))
The  `.service` method returns a constructor for a service.
{% highlight javascript linenos %}    
.service('serviceName', ServiceConstructor);

function ServiceConstructor() {
  // returns a constructor
      this.prop = ..
      this.method = ..
    Construct.prototype.inheritMe = function() {};
  return Construct;
});
ServiceConstructor.prototype.super = .... 
{% endhighlight %}    
Now, Angular instantiates the service by invoking `ServiceConstructor` with `new`, and taking the returned object as the service instance.
This ostnsibly allows us to create services that are based on classical object oriented principles, complete with inheritance.  For example, 
in the above, the service user would have access to `serviceName.super`.  Of course, we would not normally create the constructor in the global space as we have in the above example, but inject it from another service possibly from a completely separte module.

##### provider
An unfortunate duplication of nomenclature, `.provider` is syntactic sugar to give us full access to the `.config(function($prvide))` mechanism.  Note that we used `.factory` and `.service` in situations where our provider needed no configuaration of the service it was creating, only a returned `$get` method.  We use `provide` as short hand for the situation where we do need to configure the provider that will then generate the service.  Of course, the services provided using the `.provider` method
{% highlight javascript linenos %}    
.privde('serviceName', function() {
    // configure the service
    return {
     $get: function() {},
     method: function() { }
     prop: ... some value ..
})
.config(function(serviceNameProvider) {
    // configure the service as needed at config time
    serviceNameProvider.method() ...
})
{% endhighlight %}    

##### A Common Pattern
We can use a factory to return a `constructor` function. This then allows us to instantiate objects at run time.  Note though, that these objects are not services, and so they cannot be injected through the `$injector`.

{% highlight javascript linenos %}
.factory('System', function(){
    return function(config) {
        this.error = config( ... )
        this.message = ...
    }
})
.controller('AppController', function($scope, System) {
   $scope.system = new System({ .. config objec/method }); 
});
{% endhighlight %}    

#### Decorating Existing Providers
It's all good and well to create services we need from scratch, but what if we have something that is close to what we want but not quite?  Can we add some extra behavior, or modify existing behavior of services and directives?  That's where `$provide.decorate` method comes in handy.

> To use a decorator, you have to register it with the `$injector`, which will then allow it to intercept the creation of a service at config time and allow you to override the behavior. You can do this with services or directives.

To decorate a *service*
{% highlight javascript linenos %}
.config(function($provide){
    // decorate serviceName, injecting $delegate service
    $povide.decorator('serviceName', function($delegate) {
        // $delegate is the service instance
        var localRef = $delegate;
        // modify at will 
        localRef.newMethod = function() { .. };
        // and return ...
        return $delegate;
    })
});
{% endhighlight %}   

Alternatively, we can augment the service through its prototype chain:

{% highlight javascript linenos %}
 .config(function($provide){
    // decorate serviceName, injecting $delegate service
    $povide.decorator('serviceName', function($delegate) {
        // $delegate is the service instance
        var localRef = $delegate;
        Object.create($delegate.prototype, 'newProperty', {
            .. new properties to add to $delegate's prototype...
        });
    })
});
{% endhighlight %}    

Decorating a *directive* is almost identical, except the `$delegate` is an array whose `[0]` element is the directive.  That, and you have to decorate `directiveNameDirective` if the directive's name is `directiveName`:

{% highlight javascript linenos %}
.config(function($provide){
    // decorate directiveName, injecting $delegate service
    $povide.decorator('directiveNameDirective', function($delegate) {
        // $delegate[0] is the directive
        var localRef = $delegate[0];
        localRef.restrict = 'EAC';
        return $delegate;
    })
});
{% endhighlight %} 

### References
1. [Object Oriented AngularJS Services](http://blog.revolunet.com/blog/2014/02/14/angularjs-services-inheritance/)
2. [Experiment Decorating Directives](http://angular-tips.com/blog/2013/09/experiment-decorating-directives/)
3. [Presenter Pattern - egghead.io](https://egghead.io/lessons/angularjs-provide-decorator)

> Total Side Note: In the 'Presenter Pattern' video,  reference [3], they use both the 'common pattern', and the 'alternate augmentation method' described above. They also use [`Object.defineProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty), which I had studied but totally forgotten about!  It's the modern way of adding properties to object with much finer level of control.