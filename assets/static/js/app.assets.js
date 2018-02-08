app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.assets', {
      url: "/assets",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.assets.html',
          controller: 'businessManagement.assets',
        }
      }
    })
});
app.controller("businessManagement.assets", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
