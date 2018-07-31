app.config(function($stateProvider){
  $stateProvider.state('businessManagement.employees.list', {
    url: "/list",
    templateUrl: '/static/ngTemplates/app.employees.list.html',
    controller: 'businessManagement.employees.list'
  });
});
app.controller("businessManagement.employees.list", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {
});
