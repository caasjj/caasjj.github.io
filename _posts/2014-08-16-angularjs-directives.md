---
layout: post
title:  "AngularJS Directives"
date: Sat August 16, 2014 4:54 PM
categories: journal
---

Directives are intended to extend the behavior of HTML.  They can either be attached as `attributes` and `classes` to existing HTML tags, or define arbitrary new tags. This opens up the following important questions:

* how do we make our controller scope available to the directive
* how to do nest other HTML tags as children of the newly defined directive
* how to we make sure our directive is being invoked in *the right context*
* how to do we share data between directives
* how do we encapsulate directive behavior so it behaves predictably no matter the context

A most basic directive can be defined simply as

{% highlight javascript %}
var app = angular.module('myModule', []);
app.directive('plunkme', function() {
    return {
        restrict: 'EAC',
        template: '<p>I am a directive</p>'
    }
});
{% endhighlight %}

And, now we can use this directive as an `A`ttribute or `C`lass of any existing tag or a new tag `E`lement altogether.  If the `restrict` field is omitted, it defaults to `A` because the most common use case for directives is to add behavior to existing tags using an `A`ttribute.

{% highlight html %}
<plunkme></plunkme> 
<div plunkme></div>
<div class="plunkme"></div>
{% endhighlight %}

All of the above will create a `P` tag with the text **I am a directive**. 

*Note that in the above example, any content already in the tag would be overwritten by the directive.* That's where `transclusion` will come in in a bit.
 
To do something more useful than define a simple template, say we want to add behavior via an attribute, we can define a *link function* for the directive

{% highlight javascript %}
var app = angular.module('myModule', []);
app.directive('plunkme', function() {
    return {
        restrict: 'EC',
        link: function(scope, element) {
            element.bind('mouseenter', function() {
                // do something
            })
        }
    };
});
{% endhighlight %}

This is in fact so common that we typically just return the *link function* implicitly - recall that `restrict` defaults to `A` if no defined. The link function receives the `scope` of the directive, the `element` itself as well as its `attributes` as parameters.

{% highlight javascript %}
var app = angular.module('myModule', []);
app.directive('plunkme', function() {
    return function(scope, element, attributes) {
            element.bind('mouseenter', function() {
                // do something
            })
        }
});
{% endhighlight %}
