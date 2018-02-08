app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.logistics.food', {
      url: "/food",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.logistics.food.html',
          controller: 'workforceManagement.logistics.food',
        }
      }
    })
});
app.controller("workforceManagement.logistics.food", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
