app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.organization.divisions', {
      url: "/divisions",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.organization.division.html',
          controller: 'workforceManagement.organization.division',
        }
      }
    })
});
app.controller("workforceManagement.organization.division", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
