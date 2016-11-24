// you need to first configure the states for this app

app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.finance', {
    url: "/finance",
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
  .state('businessManagement.finance.expenses', {
    url: "/expenses",
    templateUrl: '/static/ngTemplates/app.finance.expenses.html',
    controller: 'businessManagement.finance.expenses'
  })
});


app.controller('businessManagement.finance.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller


})
