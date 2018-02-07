app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.logistics.stay', {
      url: "/stay",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.logistics.stay.html',
          controller: 'workforceManagement.logistics.stay',
        }
      }
    })
});
app.controller("workforceManagement.logistics.stay", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
