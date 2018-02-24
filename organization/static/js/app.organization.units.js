app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.organization.units', {
      url: "/units",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.organization.units.html',
          controller: 'workforceManagement.organization.units',
        }
      }
    })
});
app.controller("workforceManagement.organization.units", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
