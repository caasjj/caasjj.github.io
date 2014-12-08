---
layout: post
title:  "Deploying Sails on AWS "
date: Sun August 10, 2014 6:53 AM
categories: journal
---

7:01 AM Note on what I had to do to get my sails test app manually deployed on AWS EC2

### Manual Deployment
1. security info in [Crypt](file:///Users/developer/Desktop/security/crypt.tc)
2. login to [AWS Management Console](http://aws.amazon.com) using Amazon credentials (walidhosseini@gmail.com)<BR>
 	a. to manage instance, go to EC2->Instances
3. To gain SSH and rsync access<BR>
	a. get `aws-ssh.pem` certificate file from the crypt, and store in `~/.ssh/` <BR>
	b. store pem file in keychain with `ssh-add -K aws-ssh.pem` <BR>
	c. to get a secure shell: <BR>
	`ssh -i ~/.ssh/aws-ssh.pem ubuntu@ec2-54-186-47-120.us-west-2.compute.amazonaws.com` <BR>
	d. to use rsync to sync a local directory to the remote<BR>
	`rsync -super -r -a -v -e  "ssh -l $AWS_USER" --delete $AWS_WWW_LOCAL/www $AWS:$AWS_WWW_REMOTE`, where<BR>
	......$AWS_USER=ubuntu, <BR> 
	......$AWS_WWW_LOCAL/www is some local local directory<BR> 
	......$AWS=ec2-54-186-47-120.us-west-2.compute.amazonaws.com ('public DNS' from step 2.a above)<BR>
	......$AWS_WWW_REMOTE is the remote directory<BR> 
	e. to use rsync to pull down the remote to the local<BR>
	`rsync -r -a -v -e "ssh -l $AWS_USER" --delete $AWS:$AWS_WWW_REMOTE/www $AWS_WWW_LOCAL`<BR>
	f. you'll need to install <BR>
	......ruby (`apt-get install ruby`)<BR>
	......ruby gem (`apt-get install ruby-gem`)<BR>
	......Sass (`gem install sass`)<BR>
	......grunt (`npm install -g grunt`)<BR>
	g. start up the node app in AWS with `forever`, `nodemon`, `sails lift` or just `node app.js`<BR>
	h. make sure to open up the app's port in one of the security groups in EC2->Network Security-->Security Groups<BR>
* currently, have **ports 2368-2370** open, in line with my ghost blog requirement
	
### Git Deployment
1. [Generate an SSH key](https://help.github.com/articles/generating-ssh-keys) to be used for read-only access to your git repo <BR>
   a. `ssh-keygen -t rsa -C caasjj@gmail.com`, indicate passphrase and where to save the pem file <BR>
   b. I generated key in `~/.ssh/bitbucket_git_deploy` and uploaded to [BitBucket sailJade repo](https://bitbucket.org/caasjj/sailjade/admin/deploy-keys)
   
> Spent some time sudying Git deployment on AWS. Turns out, it's fairly straight forward but requires a bunch of things to set up.
I set up an RDS (Relational Database Service), and a DevOps stack.  You can configure a database and associated security rules through RDS, and then a 'stack' through DevOps to use Layers (EC2, RDS, etc), and then instantiate apps to use these various layers. I was able to create a database and access it through my local machine, as well as instantiate a Node.js app server but did not actually install an app.  You can install an app vis Git/Subversion source control.  The node.js app by default has to be called `server.js` and listen on `port 80`.  I don't know how to remap these and did not want to bother figuring out - not worth the time at this point.  So, I will stick to manual/rsync deployment for now.