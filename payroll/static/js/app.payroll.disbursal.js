app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.payroll.disbursal', {
      url: "/disbursal",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.payroll.disbursal.html',
          controller: 'workforceManagement.disbursal',
        }
      }
    })
});
app.controller("workforceManagement.disbursal", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
