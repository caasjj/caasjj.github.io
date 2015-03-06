---
layout: post
title:  "Publishing a Bower Package"
date: Thu September 11, 2014 10:14 PM
categories: journal
---

Bower is a super convenient package manager for front end JS code - similar to NPM for node.  We summarize a brief
method for encapsulating code in a bower package and installing it from a Git repo or even bower's own registry.

###  Bower Components
The following is based entirely on Reference [1].  It's very straightforward to create a bower installable component.  I document the process that I went throught to create `angular-foundation-carousel` here.

1. Create a standalone, re-usable angular component in its own directory
2. `bower init` in the directory, and answer the interactive questions
    * note that the `name` field is the package name that will be installed by Bower
    * this is *not necessarily* the same as the `git` repo name below - these are totally decoupled
3. `git init` to initialize your git repo
4. `git commit`, with a reasonable commit message
5. `git tag v.x.x.x`, this is what bower uses to identify the version of the package for clients to install
6. push the local repo to a `github` remote 
    * `git remote add origin git@github.com/caasjj/<some-bower-package>.git`
    * `git push -u origin master`
7. To add the package to a project in `bower_compoenents`
    * `bower install caasjj/<some-bower-package>.git`
8. To be able to install with a simple `bower install <some-bower-package>`, you have to register the package in the registry
    * `bower register <some-bower-package> git@github.com/caasjj/<some-bower-package>.git`

### References
1. [Writing Reusable AngularJS Components with Bower](http://briantford.com/blog/angular-bower) 
