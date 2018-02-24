
app.config(function($stateProvider){

  $stateProvider
  .state('workforceManagement.performance', {
    url: "/performance",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@workforceManagement.performance": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@workforceManagement.performance": {
          templateUrl: '/static/ngTemplates/app.performance.dash.html',
          // controller : 'projectManagement.LMS.default',
        }
    }
  })
});
app.controller("workforceManagement.performance", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
