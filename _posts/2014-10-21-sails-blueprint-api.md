---
title: Sails Router and Blueprint API
date: Tue Oct 21, 2014 4:46 PM
---

Routing is a central part of the backend of a web application, and one of the core responsibilities of *Express*, and by extension Sails.  While routing is incredibly flexible in Sails, there is also a great deal of redundancy.  In this article, we examine the routing mechanism and the boilerplate code known as Blueprints.  As we will see shortly, there are three kinds of blueprint routes in Sails, designed to provide a true REST API, direct access to controller actions and access to REST API through the browser.

## Routes

You can define routes (custom as opposed to Blueprint) and map them to various actions in several different ways.   

> Custom routes are defined in `config/routes`.

A route consists of an `address` and a `target` which are connected to one another as:

`address`: `target`

### Route Address

The `address` itself is composed of `verb path`, where `verb` is an HTTP verb, and `path` is a valid URL.  So, a route might look like this:

`POST /foo/bar: 'FooController.bar'`

This says to invoke the method `FooController.bar` whenever a `POST` is done to the URL `/foo/bar`.

The path, e.g. `/foo/bar` above, need not be static as shown.  It can use wildcards, named parameters, or even *Regular Expressions*.

`/*` will match any route. `/foo/*` will match any route starting in `/foo/`.  

The drawback of using the `*` wildcard character is that you do not get the value of the substituted block.

`/user/foo/:id/bar/:param` will match the URL `/user/foo/2/bar/baz`, and the associated controller action can read the values of `:id` and `:param` respectively with `req.param('id')` and `req.param('param')`.

> Note that a route is matched on first come first serve. i.e. once a match is found, no further matches are attempted. So, the order in which routes are entered matters!  If, for example, you have the following route in the given order, the second route will *never* match:
> `GET /user/:id`
> `GET /user/10`

### Route Target

The target of the route can be any one of the following:

* ***Controller action***: a method on a controller
* ***View***: a view template, e.g. `.ejs`, `.jade`, etc.
* ***Blueprint***: Blueprint action, e.g. `find`, `create`, etc.
* ***Redirect***: a redirect URL or route
* ***Response***: a response from `config/responses`, e.g. `notFound`
* ***Policy***: a policy middleware from `config/policies`

#### Controller Action Target

Here, we need to identify a controller and an associated action (method), which can be done with any of the following formats:

The `GET /foo/anaction` address can be mapped to any of the following equivalent targets:

* `FooController.someAction` // a method defining an action
* `FooController.find` // a blueprint action, or any method overriding it
* `Foo.someAction`           
* `{controller: "Foo", action: "anaction" }`
* `{controller: "FooController", action:"anaction"}`

#### View Target

Often, we just want a route to present a new view (traditional, non-spa web app).  This can easily be done by providing the path to the view (e.g. `.ejs`, or `.jade`) relative to the `api/views` subdirectory without the extension.

For example: 

* `GET /home: {view: 'index'}
* `GET /cart: {view: 'customer/purchase'}

#### Blueprint Target

As seen previously, Blueprint actions are by default mapped to standard routes. (e.g. `GET /model/:id` maps to `ModelController.findOne`). 

> *Blueprint Targets* allow you to override that behavior and allow other addresses to be mapped to the Blueprint Actions.

For example:

<table>
 <tr>
   <th> Route
   </th>
   <th> Action
   </th>
   <th> Description
   </th>
 </tr>

 <tr>
   <td>GET /findMyPurchases
   </td>
   <td> {model: 'purchase', blueprint: 'find'}
   </td>
   <td>`find` action of `purchase` controller
   </td>
 </tr>
 
  <tr>
   <td>GET /purchase/findThemAll
   </td>
   <td> {blueprint: 'find'}
   </td>
   <td> model implicitly set to `purchase`
   </td>
 </tr>
  
 <tr>
   <td>GET /purchase/findThemAll
   </td>
   <td>{model: 'account', blueprint: 'find'}
   </td>
   <td> implicity `purchase` model overridden to `account` (<sub>* Don't ever do this!!</sub>)
   </td>
 </tr>
 </table>
 
#### Redirect Target

Sometimes, you may want to redirect the user to a new route or even an external URL.
<table>
 <tr>
   <th> Route
   </th>
   <th> Action
   </th>
   <th> Description
   </th>
 </tr>
 <tr>
   <td>GET /someroute
   </td>
   <td>http://www.google.com
   </td>
   <td>Redirect to any other URL or local route
   </td>
 </tr>
 </table>
 
 
#### Response Target
 
It is also possible to send an immediate response from those in `/api/responses`, e.g. `/api/responses/notFound.js`:
 
 <table>
 <tr>
   <th> Route
   </th>
   <th> Action
   </th>
   <th> Description
   </th>
 </tr>
  <tr>
   <td>GET /someroute
   </td>
   <td>{response: 'notFound'}
   </td>
   <td>any of the responses in `/api/responses`, without the `.js` extension
   </td>
 </tr>
</table>

#### Policy Target

Policies can be applied to different routes, using very similar notation, in `/config/policies.js`.  However, you can also explicitly assign a policy to a route in `/config/routes.js`.  Since policies are not normally intended to be the final action of a route, you should have additional target on this route that can respond to the request.

 <table>
 <tr>
   <th> Route
   </th>
   <th> Action
   </th>
   <th> Description
   </th>
 </tr>
  <tr>
   <td>GET /someroute
   </td>
   <td>{policy: 'apolicy'}
   </td>
   <td>Apply policy `apolicy` to route `someRoute`, if `next()` called run `someroute` model's `find`
   </td>
 </tr>
</table>

### Target Options

> Any attributes added to the route target will be passed on to the next middleware and finally the route handler through the `res.options` object.

Some attributes, however, are reserved and used to affect the behavior of the handling of the route.  Routes with Target Options use an `object` as the target using `controller:`, `action:` notation in conjunction with the following *reserved attributes*  (see [Route Target Options](http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html)):


* `skipAssets`, `skipRegex`: (all targets) avoid matching static assets 
([Url Slugs](http://sailsjs.org/#/documentation/concepts/Routes/URLSlugs.html))
* `locals`: (no policy, response targets) variables passed to the view template
* `cors`: (all targets)specifies how to handle CORS for this route
* `populate`: (Blueprint target) true/false, whether to fill in associations in `find`/`findOne`
* `skip`,`limit`,`sort`, and `where`: (Blueprint target) SQL criteria for `find` blueprint

For example: 

{% highlight javascript linenos %}
'/GET /somepath': { 
  controller: 'acontroller',  
  action: 'find',  // activate 'acontroller.find' blueprint action
  populate: false,     // do not populate associations
  cors: '*', // CORS from all domains
  where: {
      'inactive': false // do not include inactive records
  }
}
{% endhighlight %}


<hr/>
## Blueprint Routes

As seen above, Sails, like any *Express* app has a router that can be configured in fine details.  But, this involves a great deal of boilerplate, repetive code.  So, Sails  binds many *predictable* routes automatically to controller code that is also generated automatically.  These automatic, or blueprint, routes can be categorized in three groups:

### RESTful routes
 
RESTful route paths are of the form 

* `/:model` for collections
* `/:model/:id` for individual resources
* `/:collection/:id/:model` for one to many associations 
* `/:collection/:id/model/:modelId` for one to one assocications. 

They all use HTTP verbs as follows:
  
  <div class="row">
  <div class="column large-offset-1 large-10">
  <table>

  <tr>
  <th>HTTP Verb</th>
  <th>Route</th>
  <th>CRUD Action</th>
  </tr>

  <tr>
      <td>POST</td>
      <td>/:model</td>
      <td>*CREATE* a new `model`</td>
  </tr>
  <tr>
      <td>PUT</td>
      <td>/:model/:id</td>
      <td>*UPDATE* `model` with `id`=id</td>
  </tr>
  <tr>
      <td>DELETE</td>
      <td>/:model/:id</td>
      <td>*DELETE* `model` with `id`=id</td>
  </tr>
  <tr>
      <td>GET</td>
      <td>/:model</td>
      <td>*READ* collection of `model` models</td>
  </tr>
  <tr>
      <td> </td>
      <td>/:model/:id</td>
      <td>*READ* `model` with `id`=id</td>
  </tr>
  </table>
  </div>
  </div>
  
 Since RESTful blueprint routes are intended to be used in production, they should be protected by *policies* to control access. See [Policies](http://localhost:4000/journal/2014/10/21/sails-config-hooks-policies-and-services.html).
 
These blueprint routes can be disabled either globally, by setting the `rest` property of `config/blueprints.js` to fale, or in a given controller with 

{% highlight javascript linenos %}    
module.exports = {
  _config: {
    rest: false
  }
};
{% endhighlight %}

### Shortcut Routes

Shortcut Routes make it possible to exercise any CRUD verb via the `GET` method, thereby providing complete access to models directly via the browser.  


  <div class="row">
  <div class="column large-offset-1 large-10">
  <table>

  <tr>
  <th>Route</th>
  <th>CRUD Action</th>
  </tr>
  <tr>
      <td>GET /:model/create?param=somevalue</td>
      <td>*CREATE* a new `model` with `param` set to `somevalue`</td>
  </tr>
  <tr>
      <td>GET /:model/update/:id?param=somevalue</td>
      <td>*UPDATE* `model` with `id`=id with `param` to `somevalue`</td>
  </tr>
  <tr>
      <td>GET /:model/destroy/:id</td>
      <td>*DELETE* `model` with `id`=id</td>
  </tr>
  <tr>
      <td>GET /:model/find</td>
      <td>*READ* collection of `model` models</td>
  </tr>
  <tr>
      <td>GET /:model/:id</td>
      <td>*READ* `model` with `id`=id</td>
  </tr>
  </table>
  </div>
  </div>
  
  Note that associations are also supported, e.g. via <br>`GET /:collection/:id/model/create?param=somevalue`
  
  > Clearly, these are intended *only for development* and should be disabled *globally* via the `shortcuts` attribute of the configuration object in `config/blueprints.js` or on a per-controller basis with 

{% highlight javascript linenos %}    
module.exports = {
  _config: {
   shortcuts: false
  }
};
{% endhighlight %}


### Action Routes

Action routes give access to custom actions of your controller.  For example, given a controller `FooController` with an action `bar`, then the route `foo/bar?param=somevalue` will invoke `FooController.bar`.

> Action routes are the only Blueprint identity created even for controllers that do not have an underlying model.

## Blueprint Actions

Given a model file `SomeModel.js`, and an associated *empty* controller `SomeModelController.js`, then the following actions will *automatically* be created for `SomeController`:

<table>
  <tr>
    <th>
     Action
    </th>
    <th>
     Parameter
    </th>
    <th>
     Result
    </th>
    <th>
    Route
    </th>
  </tr>
  <tr>
    <td>
    find
    </td>
    <td>
    *
    </td>
    <td>
    Filter based on attribute
    </td>
    <td>
    GET /purchase?amount=10
    </td>
  </tr>
  <tr>
    <td>
     -
    </td>
    <td>
    where
    </td>
    <td>
    waterline/SQL WHERE criteria
    </td>
    <td>
     GET /purchase?where={"amount":10}
    </td>
  </tr>
   <tr>
    <td>
     -
    </td>
    <td>
    limit,skip,sort
    </td>
    <td>
    waterline/SQL pagination criteria
    </td>
    <td>
     GET /purchase?limit=5&skip=10&sort=name%20ASC
    </td>
  </tr>
  <tr>
    <td>
    findOne
    </td>
    <td>
    id
    </td>
    <td>
    Find item with given id
    </td>
    <td>
    GET /purchase/2
    </td>
  </tr>
  
    </tr>
    <tr>
    <td>
    create
    </td>
    <td>
    *
    </td>
    <td>
    Create item
    </td>
    <td>
    GET /purchase?item=5  <br>POST /purchase (body JSON: {"item":5})
    </td>
  </tr>
  <tr>
    <td>
    destroy
    </td>
    <td>
    id
    </td>
    <td>
    Delete item with given id
    </td>
    <td>
    DELETE /purchase/2<br>
    DELETE /purchse (body JSON: {"id":2})
    </td>
  </tr>
    <tr>
    <td>
     -
    </td>
    <td>
    id
    </td>
    <td>
    Delete from collection
    </td>
    <td>
    DELETE /store/2/purchase/:id<br>
    </td>
  </tr>
  
    <tr>
    <td>
    update
    </td>
    <td>
    id
    </td>
    <td>
    Update record with id
    </td>
    <td>
    PUT /purchase/2 (body JSON: {"param":"value"})<br>
    GET /purchase/2?param=value<br>
    POST /purchase/2 (body JSON: {"param":"value"})
    </td>
  </tr>

    <tr>
    <td>
     -
    </td>
    <td>
    id
    </td>
    <td>
    Make an association
    </td>
    <td>
    POST /store/10/purchase (body JSON: {"id":2})
    </td>
  </tr>
    
</table>    

Blueprint RESTful routes and Blueprint Shortcut routes (as described above) are automatically bound to these corresponding Blueprint Actions.  

These can, however, be overriden for any controller either by

1. By defining an action of the appropriate name in a given controller itself, e.g. `update`, or `find`
2. By *globally overriding* a given action by defining a custom Blueprint Action in `api/blueprints/action.js`, where `action` is one of `find`, `create`, etc. of the above Blueprint Actions.

