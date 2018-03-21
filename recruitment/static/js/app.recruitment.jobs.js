app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.recruitment.jobs', {
      url: "/jobs",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.recruitment.jobs.html',
          controller: 'workforceManagement.recruitment.jobs',
        }
      }
    })
});
app.controller("workforceManagement.recruitment.jobs", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

});
