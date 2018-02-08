app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.logistics.travel', {
      url: "/travel",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.logistics.travel.html',
          controller: 'workforceManagement.logistics.travel',
        }
      }
    })
});
app.controller("workforceManagement.logistics.travel", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
