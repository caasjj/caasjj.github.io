---
layout: post
title:  "Angular Animations with CSS3"
date: Wed September 2, 8:33 AM
categories: journal
---

There are two distinct ways to perform CSS3 animations, and angular supports them both: *transitions*,
and *keyframe animations*.  In this article, we cover the simpler of the two, *transitions*.

### CSS3 Transitions

#### Intro
To perform transitions on an element, we have to define the transition by specifying what CSS properties it applies to, and what its transition curve is (See References [1] for *Cubic Bezier*):

{% highlight css %}
.animated {
  transition: property duration timing delay;
}
{% endhighlight %}

where

* property : any [animatable CSS3 property](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties)
* duration : time in seconds
* timing  : [ease\|ease-in\|ease-out\|linear\|step-start\|step-end\|steps(a,b)\|cubic-bezier(a,b,c,d)]((https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function)
)
* delay   : time in seconds

> The above is actually shorthand for the actual CSS3 fields `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.  See [Using CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_transitions)

Now, anytime the CSS3 `property` is modified, the `transition` will apply.  The CSS property is typically modified by defining some animation class:

{% highlight css %}
.animated {
  transition: transform 1s cubic-bezier(0.25, 0.5, 0.8, 1) 0s;
  
}
.animated.animation {
  transform: translate(0, 100px);
}
{% endhighlight %}

Then, somewhere in your javascript, you have to `$('.animated').addClass('animation')` to move the element down 100 pixels, and then `$('.animated').removeClass('animation')` to move it back.

#### Transitions with Angular
Angular animates its directives according to 3 separate groups:

1. DOM Manimpulation    : Item enter/leave DOM (`ngRepeat`, `ngView`, `ngInclude`, `ngSwitch`, `ngIf`)
2. Class modifification : Class add/remove (`ngClass`)
3. Hide/Show            : Item being show/hide (`ngShow`, `ngHide`)

##### Class Manipulation - `ngClass`

-----
When adding a class, say `anim`, to animate an elment selected with class `animated`, i.e. performing the equivalent of `$('.animated').addClass('anim')` using e.g. `ngClass` directive or `$animate.addClass(element, 'anim')` directly,  angular adds the following classes to manage the animation:

* `.animated.anim-add`
* `.animated.anim-add-active`
* `.animated.anim-remove`
* `.animated.anim-remove-active`

So, when adding the `.anim` class, the set of classes on the animated item are sequenced through:

1. `.animated` : start by calling `$animate.addClass(element, 'anim');`, returning animation callback promise
2. `.animated .ng-animate` : Run any JS defined animations on the item
3. `.animated .ng-animate .anim-add` : add the `anim-add` class and wait for a single animation frame, performing a reflow
4. `.animated .anim-add .anim-add-active .anim` : add the `anim-add-active` and `anim` classes, starting the animation
5. `.animated .anim` : wait for end of transition, remove `-add` and `-add-active` classes, resolve the returned promise

Removing the class follows the exact same process with `-remove` and `-remove-active` classes, and also removal of `.anim` class at the end.

[Example - see jsFiddle](http://jsfiddle.net/caasjj/xqpowyfa/)

{% highlight html %}
<div ng-app="animationApp" class="container">
    <!-- ngAnimate class add/remove triggered with ngClass -->
    <!-- bind the class to the scope value of slider, which -->
    <!-- we will set to 'anim', or '' with animIt() -->
    <div class="animated" ng-class="className">   
    </div>
    <button ng-click="animIt()">Slide</button>
</div>
{% endhighlight %}

{% highlight css %}
/* block to animate */
.animated {  
    width: 100px;
    height: 100px;
    background-color: red;
    /* set all transition durations to 5s */
    transition: all linear 5s;
}

.animated.anim {   
    /* slide down 100 pixels */
    transform: translate(0,100px);
}
.animated.anim-add {  
    /* start animation at 0 pixels */
    transform: translate(0, 0px);
}

.animated.anim-add-active {  
    /* end animation at 100px, final */
    transform: translate(0,100px);
}

.animated.anim-remove { 
    /* reverse for remove, starting at 100px */
    transform: translate(0,100px);
  }

.animated.anim-remove-active { 
    /* and ending at 0 */
    transform: translate(0, 0);
  }

button {
    position: fixed;
    left: 300px;
    top: 0px;
}
{% endhighlight %}

{% highlight javascript %}
angular.module('animationApp', ['ngAnimate']).
run(function($rootScope){
    $rootScope.name = 'Hello World';
    $rootScope.show = false;
    $rootScope.className = "";
    $rootScope.animIt = function() {        if ($rootScope.className === "anim") {
            console.log('Remove class', $rootScope.className);
            $rootScope.className = "";
        }
        else {
            $rootScope.className = "anim";
            console.log('Add class ', $rootScope.className);
        }
    }
});
{% endhighlight %} 
  

##### DOM Manipulation - `ngRepeat`, `ngView`, `ngInclude`, `ngSwitch`, `ngIf`

-----
Angular automatically adds the following classes at the indicated time (assuming the element being animated has class `animated`):

* .animated.ng-enter        : starting point animation for DOM entry
* .animated.ng-enter-active : ending point animation for DOM entry
* .animated.ng-leave        : starting point animation for DOM removal
* .animated.ng-leave-active : ending point animation for DOM removal

DOM manipulation animations are very similar to class based animations, except they apply to different directives and use the `.ng-enter` / `.ng-leave` / `.ng-move` (the last one applies only to `ng-repeat` when items are removed or filtered and others have to move in place) instead of the `.classname-add` / `.classname-remove` selector scheme.

> A neat trick to force smooth vertical scrolling of list items as items are removed or added is to add `line-height: 100%` to `ng-remove`, and `line-height: 0` to `ng-remove-active`, and the reverse, `line-height: 0` and `line-height: 100%` to `ng-add` and `ng-add-active` respectively. ([See this jsFiddle](http://jsfiddle.net/caasjj/aqxwguhb/))

##### Hide / Show - `ngHide`, `ngShow`

-----

`ngHide` / `ngShow` could actually be considered a special case of the class based animation, where the class name is simply `ng-hide` and `ng-show`.  Here, the temporary classes added will be `.ng-hide-add`, `.ng-hide-add-active` and `.ng-hide-remove`, `.ng-hide-remove-active`.  Similary for `ngShow`.

Of course, these animations will be tied to the `ngHide`, `ngShow` directives and not `ngClass`.


### References
[1] [Cubic Bezier](http://cubic-bezier.com/#.17,.67,.83,.67())<br>
[2] [3D Carousel jsFiddle](http://jsfiddle.net/caasjj/m51Lg525/)