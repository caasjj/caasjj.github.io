---
title: Journal Entry
date: Wed Nov 5, 2014 7:12 AM
---

Today's plan is to finalize the model relationships and authentication / access middleware.  

### Many to Many Through ..

8:58 AM: Spent over an hour and a half getting to the bottom of the Waterline/MySQL 500 error, and posted on Sails issues (https://github.com/balderdashy/sails/issues/2218).  Is this worth it? Don't know yet..

Tried to get ManyToMany-Through relations working for the Network model, but couldn't figure it out.  Created a sample gist but no one could help in irc.

The following is a gist my [github/caasjj](https://gist.github.com/caasjj/bfc366d693860d02526a) 

{% highlight javascript linenos %}    
//Room.js
module.exports = {
 
  attributes: {
    roomName: {
      type: 'string'
    },
    users: {
      collection: 'user',
      via: 'rooms',
      through: 'roomuser'
    }
  }
};

//User.js
module.exports = {
 
  attributes: {
    name: {
      type: 'string'
    },
    rooms: {
      collection: 'room',
      via: 'users',
      through: 'roomuser'
    }
  }
};

//RoomUser.js
module.exports = {
 
  attributes: {
    topic: {
      type: 'string',
      required: true
    },
    users: {
      references: 'user',
      via: 'rooms',
      foreignKey: true,
      on: 'id'
    },
    rooms: {
      references: 'room',
      via: 'users',
      foreignKey: true,
      on: 'id'
    }
  }
  
};
{% endhighlight %}

So I ended up implementing a ManyToMany relationship between a User model and a Network model - i.e. a User can have many Network items, and a Network item can belong to up to two Users.  It doesn't strike me as a clean solution, but I'm tired of running around in circles on this. I will need to create validations to make sure the relationships are not accidentally screwed up by client code.

{% highlight javascript linenos %}    
//Network.js
module.exports = {

  attributes: {
    type: {
      type: 'string',
      in: ['Acquaintance', 'Colleague', 'Employee', 'Vendor'],
      defaultsTo: 'Acquaintance'
    },
    status: {
      type: 'string',
      in: ['Invite', 'Active', 'Blocked', 'Deleted'],
      defaultsTo: 'Invite'
    },
    user1: {
      type: 'integer',
      required: true
    },
    user2: {
      type: 'integer',
      required: true
    },
    users: {
      collection: 'user',
      via: 'networks'
    }
  }
};

//User.js
....
     
    networks :{
      collection:'network',
      via       :'users'
    },

....
{% endhighlight %}






