// Collections
Todos = new Mongo.Collection('todos');


if (Meteor.isClient) {
  //Subscriptions to Meteor publications
  Meteor.subscribe('todos');
  console.log("User ID is " + Meteor.userId());

  // Template helpers
  Template.main.helpers({
    todos : function() {
      return Todos.find({},{ 'sort' : { 'createdAt' : -1}});
    }
  });

  Template.main.events({
    'submit .new-todo' : function(event) {

      var text = event.target.text.value;
      console.log("text is" + text);
      /* Replae with a Meteor method call
      Todos.insert({
        'text' : text, 
        'userID' : Meteor.userID,
        'username' : Meteor.user.username,
        'createdAt' : new Date(),
        'checked' : true
      });
      */
      Meteor.call('addTodo', text);


      //Clear the form
      event.target.text.value = "";

      return false;
    },
    'click .toggle-checked' : function() {
      var self = this;
      /* Replace with Meteor method call
      Todos.update(self._id, {$set : {'checked' : ! self.checked}});
      */

    Meteor.call('setChecked',self._id, !self.checked);


      //console.log(self.checked);
    },
    'click .delete-todo' : function() {
      var self = this;
      if(confirm('Are you sure?')) {
        /* Replace with Meteor method call
         Todos.remove({'_id' : self._id});
        */
        Meteor.call('deleteTodo', self._id);
      };
    }
  });


// Change Accounts UI package default behavior so it asks for username, not email address
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  Meteor.publish('todos', function() {
    if(!this.userId) {         // Where does the "this" object come from??
      return Todos.find();
    } else {
      //console.log("user ID is :" +  userId);
      return Todos.find({'userID' : this.userId});
    }
  });
}



//Meteor Methods
Meteor.methods({
  addTodo: function(text) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    } else {
      console.log("meteor username is: " + Meteor.user.username);
      Todos.insert({
        'text' : text, 
        'userID' : Meteor.userId(),
        'username' : Meteor.user().username,
        'createdAt' : new Date(),
        'checked' : false
      });      
    }
  },
  deleteTodo: function(todoID) {
    console.log("todoID is given as " + todoID);
    var todo = Todos.findOne(todoID);
    console.log("todo is just" + todo.userID);
    if(todo.userID !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    } else {
         Todos.remove({'_id' : todoID});
    }    
  },
  setChecked: function(todoID, setChecked) {
    var todo = Todos.findOne(todoID);
    if(todo.userID !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    } else {
      Todos.update(todoID, {$set : {'checked' : setChecked}});      
    }    
  }

});


