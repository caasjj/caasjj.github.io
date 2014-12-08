---
layout: post
title:  "AngularJS Review - day 2 "
date: Thu August 14, 2014 8:25 AM
categories: journal
---

Better way to learn Angular with [thinkster.io (egghead.io)](http://www.thinkster.io/angularjs/GtaQ0oMGIl/a-better-way-to-learn-angularjs)

### Scopes
Scopes are a very important concept in AngularJS - see [Scopes](https://docs.angularjs.org/guide/scope). 
 
A scope is an object that refers to a model in the application, an execution context for expressions. Scopes (*plural*)
are arranged in the hierarchical structure of the DOM and can watch expressions (using the `$watch` API) and propagate events (using the `$apply` API).  Nested scopes are by default child scopes that inherit from their outer scope, or an `isolate scope` that does not by default inherit from its parent scope.

> The scope is the single source-of-truth for all things view related.

You can emit events from child scope to the parent scope via `$emit("someEventName")`, and broadcast from a parent to all the children via `$broadcast("someEventName")`.  You can then attach listeners with:
{% highlight javascript %}
module.controller('someController', function($scope) {
    $scope.on('someEventName', function() {
        //handle the event..
    });
});
{% endhighlight %}

*Side note: To read the value of the scope object in Chrome Dev Tool for a given directive, highlight it in the elements, and type `angular.element($0).scope()`*

### Controllers 
Define a controller to hold the model/data for a view.  
{% highlight html %}
<div ng-controller="myController1">
  <p> { { product.name }} </p>
</div>
<div ng-controller="myController2 as product">
  <p> { { product.name }} </p>
</div>
{% endhighlight %}

and then define the controller as
{% highlight javascript %}
app.controller('myController1', function($scope) {
   $scope.product = {
     name: 'Product 1'
    };
});
app.controller('myController2', function() {
     this.name = 'Product 2';
 });

{% endhighlight %}

See: Digging into ['Controller as' vs $scope](http://toddmotto.com/digging-into-angulars-controller-as-syntax/)

---

##### IMPORTANT

 If using the `$scope` dependency injection with controllers, remember that `$scope` is not itself a model, but rather a reference to the model in the context of the controller.  So, if you assign a primitive (not an JS object) value to `$scope`, then any assignments by a child scope will *overwrite* it rather than modify it by reference - as can be expected from JS prototypal inheritance!  In general, you should *not* assign [<em>primitive</em>, e.g. string, int] model properties to $scope itself. You pretty much *Always* assign models to an `object` in `$scope` so that scope inheritance chain stays intact. i.e.
 {% highlight javascript %}
   app.controller('someController', function($scope) {
       $scope.badData = 'Hello World!'; // BAD!!!
       $scope.goodData = {
        message: 'Hello World';
        };  // OK
   });
 {% endhighlight %}
 then in the template, you have:
 {% highlight html %}
 <div ng-controller="someController">
   <p> The message is : { { goodData.message }} </p>   
 </div>
 {% endhighlight %}

See [Understanding Scopes](https://github.com/angular/angular.js/wiki/Understanding-Scopes#angular-scope-inheritance), and this example [plunker](http://plnkr.co/edit/zZfUQN?p=preview).  This [best practices meetup](https://www.youtube.com/watch?v=ZhfUv0spHCY&feature=youtu.be&t=30m) also summarizes it pretty well.

 > `ng-model`, `ng-switch`, etc. should *always* have a `.` somewhere to access properties of the model!

---
 
### Services and Factories
 
 You can share data between controllers using scope inheritance.  But, this is bad practice because it too closely binds the two associated sets of Views and Controllers.  Instead, we use *services* or *factories*.  You can define a `service` with `Module.service()` and `factory` with `Moduel.factory()` as follows:
 
#### Factory
 {% highlight javascript %}
 app.factory('factoryName', function(someObj) {
     return {
         data: someObj
     }
 })
 
 app.controller('someController', function(factoryName) {
     this.data = factoryName.data;
 });
 {% endhighlight %}
 
 This factory creates an object with a single `data` parameter whose value is intialized to whatever is passed into the factory.  `someController` then sets its own `data` model to that return by the factory.
 
#### Service
 {% highlight javascript %}
 app.service('serviceName', function(someObj) {
   return function() { 
     return { 
       data: someObj 
     }
   }
 });
 
 app.controller('someController', function(serviceName) {
     this.data = new serviceName().data;
 });
 {% endhighlight %}
 
 This service creates an constructor that return an object with a single `data` parameter whose value is intialized to whatever is passed into the service.  `someController` then calls the service with `new`, and sets its `data` field to that returned by the constructor. 
 
### Forms and Controls

An angular form is an instance of `FormController` - see [FormController](https://docs.angularjs.org/api/ng/type/form.FormController).  The instance of the form can be published into the scope with the `name` attribute. Similarly, an input control instance that has an `ngModel` attribute has an instance of `NgModelController`, which provides the API for the input directive - see [NgModelController](https://docs.angularjs.org/api/ng/type/ngModel.NgModelController).<BR>

> In the following, we can get access to the `$dirty` and `$invalid` properties of the `NgModelController` instance by giving the form and input directive a `name` attribute.

{% highlight html %}
<form name="myForm" novalidate>
  <input type="text" name="userName" ng-model="user.username" /> Username
  <div ng-show="myForm.userName.$dirty && myForm.userName.$invalid">
    Invalid Username
  </div>
</form>
{% endhighlight %}

#### Creating and Submitting Forms
Angular provides builtin validation for forms, so always diable HTML5 validation with `<form novalidate .. ` <BR>
Use `ng-model` to bind the form controls to a controller scope, as in 
{% highlight html %}
<input type="text" ng-model="user.name" value="Name" /> Name
{% endhighlight %}
The `ng-model` binding above will trigger validation of the input with every change to the input.  This behavior can be modified with `ngModelOptions` attribute directive.

{% highlight html %}
<input type="text" ng-model="user.name" value="Name" ng-model-options="{updateOn: 'blur' }"/> Name
{% endhighlight %}
Now, validation will only be performed when the focus is removed from the control element.

assuming your controller has a `.update` method in its scope, you can ubmit the form with:
{% highlight javascript %}
<button ng-submit="update(user)">Submit</button>
{% endhighlight %}

#### CSS and Validation
Angular automatically adds the following (self explanatory) classes:

* ng-valid
* ng-invalid
* ng-pristine
* ng-dirty
* ng-touched
* ng-untouched

Use them to style a form as feedback to the user.  For example: 

{% highlight css %}
form input.ng-invalid.ng-dirty {
    background-color: #FA787E;
  }
{% endhighlight %}

---
2:17 PM SIDE NOTE: got yeoman angular generator working, by removing and re-installing `rvm`.  Now, you can do `yo angular` and generate a complate angular boilerplate, complete with `Sass`, `Compass` and `Bootstrap`.

---

### Filters
Filters format expression for display in views.  Filter API is `filterProvider` - see [filterProvider](https://docs.angularjs.org/api/ng/provider/$filterProvider). <br>
Simiar to the way that `module.service()` and `module.factory()` are syntactic sugar over `module.provider()`, there is a simple way to create filers with `module.filter()` as follows:

{% highlight javascript %}
module.filter('filterName', function(scopeData) {
    return function(input) {
        // do something to input value, combined with data from 
        // the scope through scopeData
    }
});
{% endhighlight %}

To use filters in a view, you use the general form:

{% highlight javascript %}
{ { expression | filter1:option1 | filter2:option1:option2:... }}
{% endhighlight %}

Here, we are sequencing `filter` with `filter2`, passing each a series of options.

Some of the builtin filters are [AngularJS filters](https://docs.angularjs.org/api/ng/filter):

 * search
 * orderBy
 * limitTo
 * currency
 * date
 * number
 * etc...
 
 To use a filter in a controller, service or directive, you have to inject it as a dependency as follows:
 {% highlight javascript %}
 module.controller('someController', ['filterFilter', 'orderByFiler', function(filter, order) {
     this.filteredData = filter(this.data, 'some string to filter by');
     this.orderedData = order(this.data, 'DESC');
 }])
 {% endhighlight %}
Here, we are injecting the `filter` and `orderBy` filters in the controller and using them as `filter` and `order` functions inside the controller to do the actual filtering.