app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.logistics.facilities', {
      url: "/facilities",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.logistics.facilities.html',
          controller: 'workforceManagement.logistics.facilities',
        }
      }
    })
});
app.controller("workforceManagement.logistics.facilities", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
