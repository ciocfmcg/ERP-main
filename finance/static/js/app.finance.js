// you need to first configure the states for this app

app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.finance', {
    url: "/GIT",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@businessManagement.finance": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@businessManagement.finance": {
          templateUrl: '/static/ngTemplates/app.finance.default.html',
          controller : 'businessManagement.finance.default',
        }
    }
  })
});


app.controller('businessManagement.finance.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller


})
