
app.config(function($stateProvider){

  $stateProvider
  .state('workforceManagement.organization', {
    url: "/organization",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@workforceManagement.organization": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@workforceManagement.organization": {
          templateUrl: '/static/ngTemplates/app.organization.dash.html',
          // controller : 'projectManagement.LMS.default',
        }
    }
  })
});
app.controller("workforceManagement.organization", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
