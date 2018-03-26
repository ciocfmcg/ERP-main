app.config(function($stateProvider){

  $stateProvider
  .state('previousSessions', {
    url: "/previousSessions",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.tutor.accoun.html',
          controller : 'home.tutor.previousSession',
       }
    }
  })


  console.log("Configured");
});

app.controller("home.tutor.previousSession", function($scope , $state , $users ,  $stateParams , $http , Flash) {


});
