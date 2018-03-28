app.config(function($stateProvider){

  $stateProvider
  .state('tutorHome', {
    url: "/tutorHome",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.tutor.tutorHome.html',
          controller : 'home.tutor.tutorHome',
       }
    }
  })
});


app.controller("home.tutor.tutorHome", function($scope , $state , $users ,  $stateParams , $http , Flash , $uibModal) {

  console.log(connection);

  $scope.online = true;

  $scope.$watch('online' , function(newValue , oldValue) {
    if (newValue) {
      window.postMessage('makeTutorOnline' , '*');
    }else {
      window.postMessage('makeTutorOffiline' , '*');
    }
  })

  $scope.$on('makeTutorOffiline', function(event, input) {
    $scope.online = false;
  });


  // connection.session.subscribe('service.tutor.list' , function(args) {
  //   console.log(args);
  // }).then(
  //   function (sub) {
  //     console.log("subscribed to topic 'tutor list'");
  //   },
  //   function (err) {
  //     console.log("failed to subscribed: " + err);
  //   }
  // );

});
