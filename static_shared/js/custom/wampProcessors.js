var connection = new autobahn.Connection({url: 'wss://'+ wampServer +':443/ws', realm: 'default'});

tutorOnline = true;
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

  tutoringSubjects = [1];
  tutoringTopics = [2];
  tutorsOnline = [];

  if (DEFAULT_ROUTE == 'tutorHome') {
    processTutoringRequests = function(args) {

      console.log("Raw args : " , args);
      if (tutorOnline) {
        console.log(args);

        if (args[0].type == 'newSessionRequest') {
          // if (tutoringTopics.indexOf(args[0].topic) != -1 && tutoringSubjects.indexOf(args[0].subject) != -1 ) {
          //   connection.session.publish('service.tutor.onlineResponse.' + args[0].id  , [{at : new Date() , tutorID : wampBindName , checked : false}], {}, {acknowledge: true});
          // }
          connection.session.publish('service.tutor.onlineResponse.' + args[0].id  , [{at : new Date() , tutorID : wampBindName , checked : false}], {}, {acknowledge: true});
        }
      }
    }


    session.subscribe('service.tutor.online', processTutoringRequests).then(
      function (sub) {
        console.log("subscribed to topic 'tutoring'");
      },
      function (err) {
        console.log("failed to subscribed: " + err);
      }
    );

    window.addEventListener("message", receiveMessage, false);

    function receiveMessage(event)
    {
      console.log("will make", event.data);
      if (event.data == 'makeTutorOnline') {
        tutorOnline= true;
      }else if (event.data == 'makeTutorOffiline') {
        tutorOnline= false;
      }
    }


    handleTutoringCall = function(args) {
      // call recieved

      console.log(args);

      var scope = angular.element(document.getElementById('main')).scope();
      console.log(scope);

      if (typeof scope != 'undefined') {
        scope.$apply(function() {
          scope.tutoringCall(args[0]);
        });
      }


    }


    session.subscribe('service.tutoring.call.'+wampBindName, handleTutoringCall).then(
      function (sub) {
        console.log("subscribed to topic 'chatResonse'");
      },
      function (err) {
        console.log("failed to subscribed: " + err);
      }
    );


  }else if (DEFAULT_ROUTE == 'studentHome') {
    // in response to student's request the tutors will share their availability
    processTutorOnlineRequests = function(args) {
      console.log("Tutor online response " , args);
      tutorsOnline.push(args[0]);
    }

    session.subscribe('service.tutor.onlineResponse.' + wampBindName , processTutorOnlineRequests).then(
      function (sub) {
        console.log("subscribed to topic 'tutoring'");
      },
      function (err) {
        console.log("failed to subscribed: " + err);
      }
    );





    handleJoinSession = function(args) {

      console.log("Will join the accepted session " , args);
      var scope = angular.element(document.getElementById('newTutoringSession')).scope();
      console.log(scope);

      if (typeof scope != 'undefined') {
        scope.$apply(function() {
          scope.dismiss();
        });
      }

      var url = '/studentHome/?session=' + args[0].sessionID;
      window.location = "http://" + window.location.host + url;
      // win.focus();
    }

    session.subscribe('service.tutoring.startSession.'+wampBindName, handleJoinSession).then(
      function (sub) {
        console.log("subscribed to topic 'chatResonse'");
      },
      function (err) {
        console.log("failed to subscribed: " + err);
      }
    );
  }



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
   console.log("Connection lost: " + reason + details);
}
connection.open();
