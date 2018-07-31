app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.employees.exitManagement', {
      url: "/exitManagement",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.employees.exitManagement.html',
          controller: 'businessManagement.exitManagement',
        }
      }
    })
});
app.controller("businessManagement.exitManagement", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
