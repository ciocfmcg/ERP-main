app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.payroll.advances', {
      url: "/advances",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.payroll.advances.html',
          controller: 'workforceManagement.advances',
        }
      }
    })
});
app.controller("workforceManagement.advances", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
