app.config(function($stateProvider){

  $stateProvider
  .state('workforceManagement.logistics', {
    url: "/logistics",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@workforceManagement.logistics": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@workforceManagement.logistics": {
          templateUrl: '/static/ngTemplates/app.logistics.dash.html',
          // controller : 'projectManagement.LMS.default',
        }
    }
  })
});
 app.controller("workforceManagement.logistics", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
 });
