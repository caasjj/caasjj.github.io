---
layout: post
title:  "Angular Digest Cycle"
date: Tue September 1, 2014 9:42 AM
categories: journal
---

`scope.$digest()` runs the digest / dirty checking cycle on the `scope`. This may need to be run multiple iterations
(up to 10 by default), in case one change in the model propagates to other parts.

##### $rootScopeProvider
The default limit of 10 digest cycle runs can be changed at module configuration time by configuring the `$rootScopeProvider` service.

{% highlight javascript %}
var myApp = angular.module('myApp', []);
myApp.config(['$rootScopeProvider', function(rootScope){
    var newLimit = 12;
    rootScope.digestTTl(newLimit); 
]);
{% endhighlight %}

##### $new() / $destroy()
Child scopes are normally created automatically by directives, but if you want to create on manually, you have to do it with `scope.$new()`, where `scope` can be `$rootScope` or any existing scope.  You have to call `scope.$destroy()` on the scope to remove its listeners and all its children scopes.

##### $watch()
To attach a listener to a scope, you use the `scope.$watch(expression, listener, [equality])` method.  The `expression` can be any expression that can be evaluated against the scope.  The `callback` has a signature of `listener(oldValue, newValue)`, and *is normally triggered to initialize the watcher*. So, to implement a listener that will *only respond to changes*, you have to do `oldValue === newValue`.

##### $apply()
If a change is made to a model *outside* of angular, e.g. in a timeout or DOM event callback, you have to use `scope.$apply()` for the change to trigger the `$digest()` cycle.  Otherwise, the change will not stay synchronized between the model and the view. Here is an example:

Given this HTML template
{% highlight html %}
<div class="content">
   <p>{ { firstname }} { { lastname }}</p>
</div>
{% endhighlight %}

The following code will change the name to **Sam Jones** after 3 seconds, not **Sam Smith**.  However, using angular's `$timout` service instead of the browser's own `setTimeout` will change the name to **  Sam Smith**.
{% highlight javascript %}
  angular.module('myApp', [])
  .controller( 'MyController', function ( $scope, $timeout ) {
    scope.firstname = 'Bob';
    $scope.lastname = 'Jones';
    setTimeout( function () {
        $scope.$apply( function () { 
             $scope.firstname = 'Sam' 
          });
        $scope.lastname = 'Smith';
       },
       3000 );
 });
{% endhighlight %}

##### $eval()
To evaluate an expression against a scope, use `scope.$eval(expression, [locals])`, where `expression` can be a *string*, which will be evaluated as an angular expression, or a *function*, which will have to take the form `function(scope) { }` and will be invoked.  Any} `[locals]` parameters will be passed to this function as arguments after scope.

{% highlight javascript %}
var $rootScope = $injector.get('$rootScope');
var $childScope = $rootScope.$new();
$childScope.name = 'Bob';
$childScope.talk = function(game) {
  console.log ('I am ' + this.name + ', I play ' + (game||'Volleyball'));
}

$childScope.$eval(function(scope, age){scope.talk(age)} ); 
// ==> I am Bob, I play Volleyball
$childScope.$eval(function(scope, age){scope.talk(age)}, 'Football' );
// ==> I am Bob, I play Football
{% endhighlight %}

##### $evalAsync()
This function is identical to `$async`, but will not execute until *after the function that scheduled it completes* and at least until the *next $digest cycle*.  If called *outside* of a $digest cycle, it will schedule another $digest cycle.