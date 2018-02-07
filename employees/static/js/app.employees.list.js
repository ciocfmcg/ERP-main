app.config(function($stateProvider){
  $stateProvider.state('workforceManagement.employees.list', {
    url: "/list",
    templateUrl: '/static/ngTemplates/app.employees.list.html',
    controller: 'workforceManagement.employees.list'
  });
});
app.controller("workforceManagement.employees.list", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {
});
