---
title: ECMA5 Javascript Classes
date: Tue Aug 19, 2014 2:05PM
tag: javascript
---

Let's take a look at constructors in Javascript, as this will shed a lot of light on Javascript's take on topics such as inheritance and object types.

><sub>Note: While the use of keywords 'new' and 'this' in Javascript makes for somewhat intuitive terminology, this re-use of common language also creates a potential for confusion. So, I always refer to the javascript keywords as <code>new</code> and <code>this</code>, and write the common usage in normal text.</sub>

<h2>Creating Objects</h2>
The easiest way to make objects in Javascript is to use object literals:

{% highlight javascript %}    
    var person = {
      'name': 'John Doe',
      'address': '1 Main St.'
    }
{% endhighlight %}    

But, what if you wanted to create multiple <code>person</code> objects. Do you have to type out each one as an object literal? Or, what if you wanted to do something more flexible and dynamic like create several of these objects with different parameters? Say, you want to dynamically create a <code>person</code> object that may or may not have a <code>hobbies</code> field at run time, maybe based on some external data. An <code>if .. else</code> clause with object literals would be pretty messy, not to mention inflexible. That's where Constructors come in, and with them the notion of 'classes' in Javascript. Confusing at first, maybe, but as we'll see momentarily, the class terminology is really no big deal here.

So, what do you do whenever you have to do something repetitive? You break it out into a function or other encapsulated execution unit of some sort and invoke it, typically with some arguments. That's what a constructor does in Javascript: It ... ummm ... constructs objects. But, here's the kicker: there's really no such thing as a 'constructor' in Javscript. No function is inherently a constructor, like <code>__constructor</code> in PHP, or a function bearing the same name as the class in Java/C++. No constructor function gets invoked behind the scenes for you, like it does in these other languages.

On the other hand, <em>any function</em> can be used as a constructor in Javascript. You just invoke the function with the keyword <code>new</code> in front of it. The arbitrary function becomes a constructor on the spot. So, it's not the function, it's how you invoke it.

{% highlight javascript %}    
    function Person(name, adr) {
      this.name = name;
      this.address = adr;
    }
    var person = new Person('John Doe', '1 Main St.');
{% endhighlight %}    

What this means in Javascript is that the context of the function (<code>this</code>) refers to a <em>newly created</em> object, and the function then returns this object. The use of <code>this</code> keyword uses one of the five <a title="Javascript Function Invocation" href="http://www.walidhosseini.com/invocation-modes-of-javascript-functions/">Invocation Modes of Javascript Functions</a>. As explained in the linked article, invoking a function intended as a constructor as a generic function (without <code>new</code>) is likely to have highly undesired effects. This occurs because without the <code>new</code> keyword, <code>this</code> will refer to the global scope - i.e. the global <code>window</code> object in a browser. So, anything done to the object referred to by <code>this</code> will be applied to the global <code>window</code> object, thereby clobbering and polluting that space. This can be seen in the following fiddle.

<iframe width="75%" height="300" src="http://jsfiddle.net/caasjj/MbN2B/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

At this point, we can see that the 'class' terminology refers to nothing more than this constructor function, i.e. we can claim to have a 'Person' class in our example above.

Just as a side note, since any function can (but not necessarily should) be used as a constructor, there is a convention to <em>capitalize functions intended to be used as constructors</em>. Again, not a strict requirement, but everyone adheres to it by convention.

## Prototype Chain
Every function has a <code>prototype</code> parameter, which is central in the role of a function as a constructor, as it creates an object's prototype chain. That is, given `function F() {}`, and `F.prototype=fProto`, then any time we type `var someObj = new F()`, then the object `fProto` will be in the prototype chain of `someObj`.  We can in fact use this to simulate a concept close to classes available in OO:

{% highlight javascript %}    
    var protoObj = {
       prop1: 'A Prototype Object',
       prop2: function() {
         console.log('I am ' + prop1);
       }
    };
    var F = function() {
      // this: refers to new object created
    }
    F.prototype = protoObj;
    F.prototype.constructor = F;
{% endhighlight %}    
Now, we can have the following:
{% highlight javascript %}    
    var someObj = new F();
    someObj.prop2(); // logs 'I am A Prototype Object'
{% endhighlight %}    
Note that in the above, we never gave `someObj` the `prop2` property.  It received it from its constructor, `F`.

Now, what if we want to implement inheritance? How do we go about defining a 'Class' such that it inherits from `F`, and extends that behavior with a `is-a` relationship. (Check the article 'is it a or has it a?' for a little discussion of this topic).  Simple, we just need to make sure that the prototype object of the new class' constructor has an object constructed with `F` in its prototype chain:

{% highlight javascript %}    
    var G = function() {
        // child class constructor
        F.apply(this, arguments);
    };
    G.prototype = Object.create(F.prototype);
    G.prototype.constructor = G;
{% endhighlight %}    
A couple of interesting points to note:

* We called `F.apply()` in the constructor `G` to make sure the parent constructor is invoked, thereby initializing any inherited properties
* We used `Object.create()` to make sure `F.prototype` would end up in the prototype chain of `G.prototype` - as opposed to creating a new `F` type object with `new F()`
* We also had to re-etablish the `constructor` property of `G.prototype` because it was overridden when we assigned to the prototype.

><sub> It is unfortunate that Javascript's `typeof` operator does not correctly report the type of an object as its `constructor`.  In fact, `typeof someObj` above would report `"object"`, and not `F`.  Fortunately, `someObj instanceof(F)` as well as `F.prototype.isPrototypeOf(someObj)` will both return `true` and can be used to establish the class relationship. These also work correctly with inheritance.

Now, if we instantiate a new `G` object, it will have the inherited behavior of `F` objects:

{% highlight javascript %}    
    var anotherObj = new G();
    anotherObj.prop2(); // I am a Prototype Object
{% endhighlight %}    

Note that inheritance is not necessarily the method of object composition that is suitable for all conditions.  In the article 'is it a, has it a, or does it behave as a?', I discuss various methods of object composition in Javascript.

<h2>Summary</h2>
Javascript constructors are simply functions whose names are by convention capitalized, and invoked with the keyword <code>new</code> preceding the invocation. Within the execution context of the function invocation preceded by <code>new</code>, the javascript keyword <code>this</code> refers to a new object created and automatically returned by the function. You can use <code>this</code> to initialize and create your object at will. Invoking a constructor without the <code>new</code> keyword clobbers the global variable space and has typically dire consequences.

The constructor's `prototype` property is an object that is added to the prototype chain of any object created by using the `new` keyword when invoking the contructor.  An object can override any property in its prototype chain simply by re-defining the property.

I should mention that Javascript is by no mean limited to the above object oriented paradigm.  In fact, Javascript functions are First Class Functions, which means they're really just another type of object.  They can be passed as arguments to other functions, dynamically instantiated and garbage collected.  That enables an entirely different form of programming I did not get exposed to at all until learning about Javascript: Functional Programming.  But that's a topic for another post.


<h2>More Reading</h2>
<ol class="aftertuts-references">
	<li><a title="MDN: Working with Objects" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects/">Working with Objects</a></li>
	<li><a href="http://dmitrysoshnikov.com/ecmascript/javascript-the-core/">ECMA-262: Javascript, the Core</a></li>
</ol>