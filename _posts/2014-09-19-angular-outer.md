---
layout: post
title:  'ngRoute - Angular Router'
date: Fri September 19, 2:52 PM
categories: journal
---     

Angular router (ngRoute) is angular's own router, even though it is packaged as a separate module.  It is the original
for Angular, as opposed to ui-router which is part of Angular UI.

#### The Basics

Install separately from Angular, with:
{% highlight javascript %}    
bower install --save angular-router
{% endhighlight %}

Then, add a `ng-view` element where you want your views to hang:

{% highlight html linenos %}    
// index.html
<div ng-app='myApp'>
  <ng-view></ng-view>
</div>
{% endhighlight %}    

> **** NOTE **** <br>
> Do NOT put a controller both as an `ng-controller` on an HTML element AND in the $routeProvider config below!!
> It will instantiate and run twice and lead to very confusing behavior.

Then, configure the router with

{% highlight javascript linenos %}   
// app.js 
var app = angular.module('myApp', []);

app.config(function($routeProvider){
  $routeProvider
  // set up a route using $routeProvider at config()
  .when('/',
    {
      templateUrl: 'app.html',
      controller: 'ViewController'
    })
    .when('/foo', 
    {
      templateUrl: 'foo.html',
      controller: 'FooViewController'
    })
   .otherwise({
      template: 'error.html'
   });
});
// try to create a route using the $route service
// provided by $routeProvider in app.config()
app
  .controller('ViewController', function($scope, $route) {
    $scope.model = { 
      message: 'Hello World' 
      // set up another route here in the controller
      // this route will be unreachable ... router doesn't recognize it
      // but no error generated, either
      $route.routes['/ctrl'] = {
        templateUrl: 'ctrl.html',
        controller: 'ViewController' 
      }
    };
  })
  .controller('FooViewController', function($scope) {
    // ...
  });
{% endhighlight %}    

{% highlight html %}
// app.html
  <h1>{ { model.message }}</h1>
// foo.html
  .. foo html code ...
// error.html
  <h1 style='{color: red}'>Error!</h1>
{% endhighlight %}    

<sub> Side note: It's always a good idea to have a top level controller, e.g. `AppController` on top of your view controllers, e.g. `ViewController` and `FooViewController` above.</sub>

#### Route Parameters
We can provide URL fragments to the controller using `/:param` in the URL and the `$routeParams` service injected into the controller.

{% highlight javascript linenos %}    
angular.module('myApp', [])
  .config(function($routeProvider) {
    $routeProvider.when('/:collection/:resource/:id',
      {
        templateUrl: 'app.html',
        controller: 'ViewController'
      }
    )
  })
  // you can also inject $route here as well, and get 
  // the route parameters as $route.current.params
  .controller('ViewController', function($scope, $routeParams) {
    $scope.model = {
        message: 
          $routeParams.collection + ', ' +
          $routeParams.resource + ', ' +
          $routeParams.id 
    };
    console.log('Resource is: ', $scope.message );
  })
{% endhighlight %}    

#### Redirecting
When a bad URL is received, we can either use the catch-all `otherwise` method of the `$routeProvider` API, or use `redirectTo` to send the client to another route.  We can of course also do this on regular / valid route.
{% highlight javascript linenos %}    
...
  .when( {
     // route config
  })
  .otherwise({
      redirectTo: '/'   // send user to root on invalid route
  })
...
// you can also use a function to remap a path **dynamically** 
...
  .when('/collection/:item/:id', { 
     redirectTo: 
       function(routeParam, path, search) {
       // /store/employee/10?value=foo :
       // routeParam = { item: 'employee', id: 10 }
       // path: '/store/employee/10'
       // search: { value: 'foo' }
       return = '/store' + '/' +
                 search.value + '/' + 
                 routeParam.item + '/' +  
                 routeParam.id;
       // reroutes to '/store/foo/employees/10'                   
       }
  })
{% endhighlight %}    

#### Using Promises
You can force witholding of a route transition by using a promise, e.g. waiting for a `$http` service transaction to complete.  This is done through the `resolve` property of the route config.

> The `resolve` property of the route config object is an object whose keys are *promises* that must be *resolved* before the route change will start.

{% highlight javascript linenos %}    
...
 .when('/path', {
   templateUrl: 'app.html',
   controller: 'ViewController',
   resolve: {
     task1: // a promise, return by a function, a scope parameter, etc...
     task2: // another promise
     task3: // and yet another
   }
 })
{% endhighlight %}
All 3 promises `task1`, `task2` and `task3` must all be resolved before the route will transition.

It would be a very bad idea to have no other controller wrapping the above `ViewController`, because if any of the above promises gets rejected, the route will simply hang!  You need another controller which is in the parent scope of `ViewController` so that it can catch the rejected promise and act accordingly .. e.g. reroute, warn the user, etc.

> A promise can be resolved with a value.  This value will be passed on to the controller via the route *locals* (`$route.current.locals`) through the injected `$route` service.  Note that the route *parameters* (`$route.current.params`, `$route.current.pathParams`)are also available on this same `$route` service in the controller.

{% highlight javascript linenos %}    
// app.config():
...
 .when('/path', {
   ...
   resolve: {
     aPromise: appCtrl.loadSomething
     bPromise: appCtrl.doSomething
     }
  });
// AppController
appCtrl.loadSomething = function($q) {
    var defer = $q.defer();
      // synchrnously
      // defer.resolve('SomeData')
    return defer.promise;
};

appCtrl.doSomething = function() {
  ... asynchronously
    myPromises.push( createPromise() )
  ...
  return myPromises; // to return an array of promises for an array of values
    ... or ...
  return $q.all(myPromises) // to return a single promise for an array of values
}

app.controller('AppController', function($scope,$route) {
  // $route.current.locals = { 
  //     aPromise: 'SomeData', 
  //     bPromise: 'Hello World'
  //   };
});
{% endhighlight %}    

If any of the promises associated with the `resolve` field of a route is rejected, then a `$routeChangeError` event will be generated on that scope.


#### Route Events and Lifecycle

There are 3 main events associated with `$routeProvider`.  All of these can be caught by the scope of the associated controller, or any parent scope.


  * $routeChangeStart - triggered on scope of existing view's controller
  * $routeChangeSuccess - triggered on scope of ending view's controller
  * $routeChangeError - triggered on scope of existing view's controller

Example:
{% highlight javascript linenos %}
$scope.$on('$routeChangeStart', function(event, current, previous, rejection) {
                   // current: route about to go to
                   // previous: route on whose scope this event is fired
                   // rejection: rejection reason provided by the route's resolve/promise
               }
  );
{% endhighlight %}    

#### $location
`$location` is just a service that wraps `window.location`, browsing the URL in the address bar and providing convenience method to parse and manipulate it.

#### $anchorScroller

----

### References