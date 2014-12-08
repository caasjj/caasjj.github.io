---
title: Things To Do Better
date: Wed Nov 12, 2014 8:28 AM
---

Merging in upstream changes proved to be more painful than it should have been, mostly because of my own style of managing these things.  This is a summary of what I did wrong ...

### Things to do better

I used git fetch/merge to merge in the latest upstream changes, which were all in the front end.  Initially, I was getting tons of errors in the console with angular complaining about 'null names', but things still would kind of work.  Trying to log in led to strange behavior where login would work, but then the app would just sit there.

These were caused by the following:

1. The first misbehavior was caused by the fact that ui-router state names were changed, and in my own (small amount of!) code, namely `auth/login/register-controller`, I was referencing states but never updated to the new naming
2. The hanging at login was caused by changes made to private function names in `core/services/DataService` where private methods like `parseEndPointUrl` were re-named `_parseEndPointUrl`, and being used inconsistently within my own file - due the merge.

At any rate, the entire problem was caused by a lack of methodically stepping through the changes and logically unraveling the interconnected problems.

I did much better job with a problem where trying to create a user would crash the server.  This was caused by Passport's `request.login` function not getting created when the request came in via `$sailsSocket`, but would be there via HTTP requests - which is why I didn't see it with Postman.  When I initially switched over to `DataService` from `DataSocketIoService` (I had previously made the split), I only updated it in `core/models/factory.js` and did not follow through to also update the `register-controller.js`, so the request was still going over `$sailsSocket`.  But, I caught the error quickly enough and fixed it.

> The bottom line is that my mental laziness, begrudging approach to digging in the code, is costing me valuable time and emotional energy.