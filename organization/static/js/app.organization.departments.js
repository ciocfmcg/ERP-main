app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.organization.departments', {
      url: "/departments",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.organization.departments.html',
          controller: 'workforceManagement.organization.departments',
        }
      }
    })
});
app.controller("workforceManagement.organization.departments", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
