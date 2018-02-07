app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.recruitment.onboarding', {
      url: "/onboarding",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.recruitment.onboarding.html',
          controller: 'workforceManagement.recruitment.onboarding',
        }
      }
    })
});
app.controller("workforceManagement.recruitment.onboarding", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
