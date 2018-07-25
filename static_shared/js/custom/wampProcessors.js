var connection = new autobahn.Connection({url: 'ws://'+ '192.168.1.105' +':8080/ws', realm: 'default'});

// "onopen" handler will fire when WAMP session has been established ..
connection.onopen = function (session) {

   console.log("session established!");

   // our event handler we will subscribe on our topic
   //
  function chatResonse (args) {
    console.log(args);

    var status = args[0];
    var msg = args[1];
    var friend = args[2];
    var scope = angular.element(document.getElementById('chatWindow'+friend)).scope();
    console.log(scope);
    if (typeof scope !='undefined' ) {
      scope.$apply(function() {
        if (status =="T" && !scope.$$childHead.isTyping) {
          scope.$$childHead.isTyping = true;
          setTimeout( function(){
            var scope = angular.element(document.getElementById('chatWindow'+friend)).scope();
            scope.$apply(function() {
              scope.$$childHead.isTyping = false;
            });
          }, 1500 );
        }else if (status=="M") {
          scope.$$childHead.addMessage(msg , args[3])
        }else if (status=="MF") {
          console.log('attach file');
          scope.$$childHead.addMessage(msg , args[3])
        };
      });
    } else {
      if (status == 'T') {
        return;
      };
      var scope = angular.element(document.getElementById('main')).scope();
      scope.$apply(function() {
        scope.fetchAddIMWindow(args[3] , friend);
      });
    };
  };

  processNotification = function(args){
    var scope = angular.element(document.getElementById('main')).scope();
    scope.$apply(function() {
      scope.fetchNotifications(args[0]);
    });
  };

  processUpdates = function(args){
    var scope = angular.element(document.getElementById('aside')).scope();
    if (typeof scope != 'undefined') {
      scope.$apply(function() {
        scope.refreshAside(args[0]);
      });
    }
  };

  processDashboardUpdates = function(args) {
    console.log(args);
    var scope = angular.element(document.getElementById('dashboard')).scope();
    console.log(scope);

    if (typeof scope != 'undefined') {
      scope.$apply(function() {
        scope.refreshDashboard(args[0]);
      });
    }
  };

  supportChatResponse = function(args) {
      var scope = angular.element(document.getElementById('chatTab')).scope();
      console.log(scope);
      console.log(args);
      // console.log(scope.);

      console.log(args);

      function userExist() {
        for (var i = 0; i < scope.newUsers.length; i++) {
          if (scope.newUsers[i].uid == args[0] ) {
            if (args[1]=='M') {
              scope.newUsers[i].messages.push( {msg : args[2], sentByMe:false , created:  args[3] })
              return true
            }else if (args[1]=='MF') {
              scope.newUsers[i].messages.push( {msg:"", img : args[2], sentByMe:false , created:  args[3] })
              return true
            }
          }
        }
        for (var i = 0; i < scope.myUsers.length; i++) {
          if (scope.myUsers[i].uid == args[0] ) {
            if(args[1]=='M') {
              scope.myUsers[i].messages.push( {msg : args[2], sentByMe:false , created:  args[3] })
              return true
            }else if (args[1]=='MF') {
              scope.myUsers[i].messages.push( {msg:"", img : args[2], sentByMe:false , created:  args[3] })
              return true
            }

          }
        }
      }

      if (userExist()) {
        var s =  angular.element(document.getElementById('chatBox'+ args[0])).scope();
        console.log(s);
        // scope.$apply(function() {
        //   console.log(scope);
        //   scope.$$childHead.scroll()
        // });
      }else {
        if(args[1]=='M') {
          scope.newUsers.push( {name : 'Ashish', uid: args[0],  messages : [{msg : args[2], sentByMe:false , created:  args[3] }], isOnline:true }  )
        }else if (args[1]=='MF') {
          scope.newUsers.push( {name : 'Ashish', uid: args[0],  messages : [{msg:"", img : args[2], sentByMe:false , created:  args[3] }], isOnline:true }  )
        }
      }

  };

  session.subscribe('service.support.agent', supportChatResponse).then(
    function (sub) {
      console.log("subscribed to topic 'supportChatResponse'");
    },
    function (err) {
      console.log("failed to subscribed: " + err);
    }
  );


  session.subscribe('service.chat.'+wampBindName, chatResonse).then(
    function (sub) {
      console.log("subscribed to topic 'chatResonse'");
    },
    function (err) {
      console.log("failed to subscribed: " + err);
    }
  );
  session.subscribe('service.notification.'+wampBindName, processNotification).then(
    function (sub) {
      console.log("subscribed to topic 'notification'");
    },
    function (err) {
      console.log("failed to subscribed: " + err);
    }
  );
  session.subscribe('service.updates.'+wampBindName, processUpdates).then(
    function (sub) {
      console.log("subscribed to topic 'updates'");
    },
    function (err) {
      console.log("failed to subscribed: " + err);
    }
  );
  session.subscribe('service.dashboard.'+wampBindName, processDashboardUpdates).then(
    // for the various dashboard updates
    function (sub) {
      console.log("subscribed to topic 'dashboard'");
    },
    function (err) {
      console.log("failed to subscribed: " + err);
    }
  );

};


  // fired when connection was lost (or could not be established)
  //
connection.onclose = function (reason, details) {
   console.log("Connection lost: " + reason);
}
connection.open();
