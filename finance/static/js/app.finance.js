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
  .state('businessManagement.finance.accounts', {
    url: "/accounts",
    templateUrl: '/static/ngTemplates/app.finance.accounts.html',
    controller: 'businessManagement.finance.accounts'
  })
  .state('businessManagement.finance.costCenter', {
    url: "/costCenter",
    templateUrl: '/static/ngTemplates/app.finance.costCenter.html',
    controller: 'businessManagement.finance.costCenter'
  })
  .state('businessManagement.finance.inflow', {
    url: "/inflow",
    templateUrl: '/static/ngTemplates/app.finance.inflow.html',
    controller: 'businessManagement.finance.inflow'
  })
});


app.controller('businessManagement.finance.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller


})
