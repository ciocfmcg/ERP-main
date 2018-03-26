app.config(function($stateProvider){

  $stateProvider
  .state('account', {
    url: "/account",
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
