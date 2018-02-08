app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.payroll.claims', {
      url: "/claims",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.payroll.claims.html',
          controller: 'workforceManagement.claims',
        }
      }
    })
});
app.controller("workforceManagement.claims", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
