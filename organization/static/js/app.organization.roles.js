app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.organization.roles', {
      url: "/roles",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.organization.roles.html',
          controller: 'workforceManagement.organization.roles',
        }
      }
    })
});
app.controller("workforceManagement.organization.roles", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
