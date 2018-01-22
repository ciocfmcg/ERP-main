app.config(function($stateProvider) {
  $stateProvider.state('businessManagement.warehouse.service', {
    url: "/service",
    templateUrl: '/static/ngTemplates/app.warehouse.service.html',
    controller: 'businessManagement.warehouse.service'
  });
});

app.controller("businessManagement.warehouse.service", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, $uibModal) {




});
