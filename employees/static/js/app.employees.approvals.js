app.config(function($stateProvider){
  $stateProvider.state('workforceManagement.employees.approvals', {
    url: "/approvals",
    templateUrl: '/static/ngTemplates/app.employees.approvals.html',
    controller: 'workforceManagement.employees.approvals'
  });
});
app.controller("workforceManagement.employees.approvals", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {
});
