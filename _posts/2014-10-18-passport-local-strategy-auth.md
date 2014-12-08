---
title: Passport Local Strategy Authentication
date: Sat Oct 18, 2014 1:08 PM
---

Passport uses the concept of *strategies* to modularize the process of authentication.  While there are literally dozens of authentication strategies and providers, the simplest and probably most common is the *local strategy*, involving authentication with a username/password combination.

This project below can be downloaded from [Github](https://github.com/caasjj/passport-local-demo.git) with

`git clone https://github.com/caasjj/passport-local-demo.js`.

## Using Passport

To use passport, you have to install it first with a simple `npm install passport`.  To use any given strategy, you also have to install the strategy.  In our case, we're going to use `passport-local`, so we'll install it with `npm install passport-local`.

Then, we need the following in our code:

{% highlight javascript %}    
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
{% endhighlight %}

To create the authentication middleware, we need to do the following :
{% highlight javascript  %}  
// 'verify' is the function that performs the actual username/password validation
passport.use( <optional name String>, 
      new LocalStrategy( <optional options Object>, verify ) );
{% endhighlight %}    

The optional first parameter passed to `passport.use`, `name` if included, sets the name of the strategy.  In the `Strategy` constructor in `passport-local/lib/strategy.js`, it is initialized to `local`.  If it is included above then the `Authenticator` constructor in `passport/authenticor.js` will override it.  Otherwise, it will simply be `local`.

The second parameter is an instance of `LocalStrategy`, whose constructor is invoked with an optional first `options` object and a `verify` function - see below.

The `options` object, if included, may have the following attributes - see `passport-local/lib/strategy.js`:

* `usernameField` <br>
sets name of attribute used to obtain the username from `req` params <br> 
defaults to `username`
   
* `passwordField` <br>
sets name of attribute used to obtain the password from `req` params <br>
defaults to `password`
   
* `passReqToCallback` <br>
if true, passes *request* object to `verify` function as `(req, username, password, cb)`<br>
defaults to `false`

 
> Note that one typically creates multiple `passport-local` strategy instances even within a single *Express* app, e.g. for `login`, `signup`, `admin` routes, etc.

> It's just middleware!


### The `verify` function

The signature of the `verify` function passed to `LocalStrategy` constructor is either `function(username, password, cb)` or `function(req, username, password, cb)`, the latter if `options.passReqToCallback` is set to true in the invocation of `new LocalStrategy()`.

This function must check the validity of the `username`/`password` combination and then do one of the following:

* `cb( err )` if an actual error occurred in the process of checking the user (e.g. a dB error)
* `cb( null, false, { msg: 'error message } )` if authentication failed, e.g. bad username/password
* `cb( null, user )`, where `user` is an object containing the user's account information in case of successful authentication

Put all together, as an example for a `login` route, this looks as follows:

{% highlight javascript linenos %}    
passport.use('login', new LocalStrategy( {
   usernameField: 'username', // redundant, could override
   passwordField: 'password', // same here
   passReqToCallback: true
  }, 
  // note first parameter is request object, because passReqToCallback=true
  function(req, username, password, authCheckDone) {
    checkCredentialsAndReturnErrorOrUser(username, password, function(err, user) {
      if (err) return authCheckDone(err); 
      if (!user) {
        return authCheckDone(null, false, 'Bad username/password combination' );
      }
      return authCheckDone(null, user);
    });
  })
);

app.post('/login', passport.authenticate('login', function(err, user, info) {
    if (err) return next(err);
    if (!user) return next(null, false);
    next(null, user);
  })
);
{% endhighlight %}



### Middleware

For now, we're going to ignore session persistence (deferred to `passport.session()`, below) and look only at the `passport.initialize()` middleware.  This middleware must be installed in the `express` app using `app.use( passport.initialize( optionObj ) );`.

Defined in `passport/lib/authenticator`, passport's main file, this initialization routine sets the name of the property used to attach user information to the request object to `user` or `userProperty` if it is a property of `optionObj`.  

It also allows one to override the default middleware signature to something other than `express`' `app.use( function( req, res, next ) { } )`.

{% highlight javascript linenos %}    
app.use( passport.initialize( {
  userProperty: 'myUser' // defaults to 'user' if omitted
 })
)
{% endhighlight %}    

> Note that unlike the parameters we sent to the instantiation of `LocalStrategy`, this parameter applies to all passport instances.


### Routes and User Auth

In addition to `req.user` (or whatever parameter was passed into `passport.initialize()` for the property name), passport also attaches a `isAuthenticated()` function to the `request` object.

To protect a route against un-authenticated users, you could simply do this:

{% highlight javascript linenos %}    
app.get('/protected', verifyAuth, Controller.action)

function verifyAuth(req,res,next) {
  if ( !req.isAuthenticated() ) { 
     res.status( UNAUTHORIZED );      // constant defined elsewhere, accessible here
     return res.end('Please Login'); // or a redirect in a traditional web app, 
  }                                   // as opposed to an SPA
  next();
}
{% endhighlight %}


### Creating a Signup Sheet

As indicated above, we can protect any route with an instance of `passport-local` strategy.  Nothing prevents us from creating multiple instances and having different criteria for different routes.  For example, in the example below, we create a `/signup` route and protect it with a completely different instance of `passport-local` strategy than the one above.

{% highlight javascript linenos %}    
app.post('/signup', )
app.use('signup', )
{% endhighlight %}    


## Using Sessions
It's all good and well to verify the user's credentials one a given request, but if we don't somehow store some information for future requests, we won't have any choice but to deny them access to any protected routes.

There are basically two methods generally used for this purpose. One is token based (e.g. JWT), the other session.  We'll look at sessions in this section.

To use sessions with Passport, you'll have to require both `express-session` and also invoke `passport.session()`.  

{% highlight javascript linenos %}    
var expressSession = require('express-session');
app.use(expressSession({
  { 
    secret: 'aSecretKey' // used to sign session cookie
   }
}));
app.use(passport.initialize(//any options));
app.use(passport.session());

// method to serialize user for storage
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

// method to de-serialize back for auth
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
     done(err, user);
  });
});
{% endhighlight %}

The above provides a mechanism for storing an authenticated user's `id` and/or additional data to storage between request.  The function that actually performs the storage is a method added to the `request` object.

{% highlight javascript linenos %}    
  req.login(user, function(err) {
  if (err) { return next(err); }
  next(); // depending on where this was called from!
});
{% endhighlight %}

`request.login` will store the `user` object to `request.user`.  Also, note that `request.login()` is automatically invoked by `passport.authenticate()`, so you only need to invoke it when a user first authenticates - before they access any routes protected with `passport.authenticate` middleware.

## Putting It All Together

For a demo of all of the above concepts, checkout the super simple app at [Github](https://github.com/caasjj/passport-local-demo.git).  Using it is pretty trivial.  Just clone it, set up your MongodB, update that info in `db.js` and you're good to go.  Run the server with `node passport-local-demo.js`.  

You can use the following routes to perform the indicated tasks.  Use `Curl` if you don't want to bother with [Postman](https://twitter.com/postmanclient) - but you *really* should.

{% highlight javascript linenos %}    
// Routes descriptions
{
  'get  /'        : 'Hello World',
  'post /signup'  : 'Create user {name: String, username:String, password:String}',
  'get  /account' : 'Return user if authenticated, else 401/Unauthorized',
  'post /login'   : 'Authenticate with username/password, and login',
  'post /logout'  : 'logout',
 }
  
{% endhighlight %}
