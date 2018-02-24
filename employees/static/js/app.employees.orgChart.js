app.config(function($stateProvider){
  $stateProvider.state('workforceManagement.employees.orgChart', {
    url: "/orgChart",
    templateUrl: '/static/ngTemplates/app.employees.orgChart.html',
    controller: 'workforceManagement.employees.orgChart'
  });
});
app.controller("workforceManagement.employees.orgChart", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {
});
