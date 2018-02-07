app.config(function($stateProvider){
  $stateProvider.state('workforceManagement.employees.myCircle', {
    url: "/myCircle",
    templateUrl: '/static/ngTemplates/app.employees.myCircle.html',
    controller: 'workforceManagement.employees.myCircle'
  });
});
app.controller("workforceManagement.employees.myCircle", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {
});
