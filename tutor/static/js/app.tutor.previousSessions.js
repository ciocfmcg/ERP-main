app.config(function($stateProvider){

  $stateProvider
  .state('previousSessions', {
    url: "/previousSessions",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.tutor.account.html',
          controller : 'home.tutor.account',
       }
    }
  })


  console.log("Configured");
});

app.controller("home.tutor.account", function($scope , $state , $users ,  $stateParams , $http , Flash) {


});
