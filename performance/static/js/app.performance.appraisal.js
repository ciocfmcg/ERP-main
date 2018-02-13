app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.performance.appraisal', {
      url: "/appraisal",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.performance.appraisal.html',
          controller: 'workforceManagement.performance.appraisal',
        }
      }
    })
});
app.controller("workforceManagement.performance.appraisal", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
